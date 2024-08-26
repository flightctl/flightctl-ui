package bridge

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc/metadata"

	grpc_v1 "github.com/flightctl/flightctl/api/grpc/v1"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

const (
	WsStandaloneSubprotocol = "flightctl.standalone.auth"
	WsOcpSubprotocol        = "flightctl.ocp.auth"
)

var upgrader = websocket.Upgrader{} // use default options

type TerminalBridge struct {
	ApiUrl    string
	TlsConfig *tls.Config
	Log       *logrus.Logger
}

type GRPCEndpoint struct {
	GRPCEndpoint string `json:"gRPCEndpoint"`
	SessionID    string `json:"sessionID"`
}

func (t TerminalBridge) HandleTerminal(w http.ResponseWriter, r *http.Request) {
	deviceId, found := strings.CutPrefix(r.URL.Path, "/api/terminal/")
	if !found {
		t.Log.Warnf("Failed to get deviceId: %s", deviceId)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	client := &http.Client{Transport: &http.Transport{
		TLSClientConfig: t.TlsConfig,
	}}

	consoleUrl := t.ApiUrl + "/api/v1/devices/" + deviceId + "/console"

	req, err := http.NewRequest(http.MethodGet, consoleUrl, nil)
	if err != nil {
		errMsg := fmt.Sprintf("Could not create request: %s", err.Error())
		t.Log.Warnf(errMsg)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(errMsg))
		return
	}

	token := ""
	authHeader, ok := r.Header[AuthHeaderKey]
	if ok && len(authHeader) == 1 {
		token = authHeader[0]
		req.Header.Set(AuthHeaderKey, authHeader[0])
	}

	resp, err := client.Do(req)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to get terminal session for device %s", deviceId)
		t.Log.Warnf(errMsg)
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(errMsg))
		return
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to read terminal session response %s", err.Error())
		t.Log.Warnf(errMsg)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(errMsg))
		return
	}
	if resp.StatusCode != http.StatusOK {
		t.Log.Warnf("Unexpected terminal session response code %d", resp.StatusCode)
		w.WriteHeader(resp.StatusCode)
		w.Write(body)
		return
	}
	response := GRPCEndpoint{}
	if err := json.Unmarshal(body, &response); err != nil {
		errMsg := fmt.Sprintf("Failed to unmarshall response json: %s", err.Error())
		t.Log.Warnf(errMsg)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(errMsg))
		return
	}

	grpcEndpoint := strings.TrimPrefix(response.GRPCEndpoint, "grpcs://")
	grpcEndpoint = strings.TrimPrefix(grpcEndpoint, "grpc://")

	grpcClient, err := grpc.NewClient(grpcEndpoint, grpc.WithTransportCredentials(credentials.NewTLS(t.TlsConfig)))
	if err != nil {
		errMsg := fmt.Sprintf("Failed to create gRPC client: %s", err.Error())
		t.Log.Warnf(errMsg)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(errMsg))
		return
	}

	router := grpc_v1.NewRouterServiceClient(grpcClient)

	ctx := metadata.AppendToOutgoingContext(r.Context(), "session-id", response.SessionID)
	ctx = metadata.AppendToOutgoingContext(ctx, "client-name", "flightctl-ui")
	ctx = metadata.AppendToOutgoingContext(ctx, AuthHeaderKey, token)
	g, ctx := errgroup.WithContext(ctx)

	stream, err := router.Stream(ctx)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to create gRPC stream: %s", err.Error())
		t.Log.Warnf(errMsg)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(errMsg))
		return
	}
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	upgrader.Subprotocols = []string{WsStandaloneSubprotocol, WsOcpSubprotocol}
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to update websocket: %s", err.Error())
		t.Log.Warnf(errMsg)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(errMsg))
		return
	}
	defer func() {
		c.Close()
		_ = stream.Send(&grpc_v1.StreamRequest{
			Closed: true,
		})
		_ = stream.CloseSend()
		t.Log.Infof("Terminal session for device %s closed", deviceId)
	}()

	t.Log.Infof("Terminal session for device %s started", deviceId)
	g.Go(func() error {
		for {
			frame, err := stream.Recv()
			if errors.Is(err, io.EOF) || frame != nil && frame.Closed {
				_ = stream.Send(&grpc_v1.StreamRequest{
					Closed: true,
				})
				_ = stream.CloseSend()
				c.Close()
				return io.EOF
			}

			if err != nil {
				t.Log.Warnf("Error recieving grpc stream input: %s", err.Error())
				return err
			}
			str := string(frame.Payload)
			// Probably we should use a pseudo tty on the other side
			// but this is good for now
			str = strings.ReplaceAll(str, "\n", "\n\r")
			err = c.WriteMessage(1, []byte(str))
			if err != nil {
				errMsg := fmt.Sprintf("Failed writing to ws: %s", err.Error())
				t.Log.Warnf(errMsg)
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte(errMsg))
				return err
			}
		}
	})

	g.Go(func() error {
		for {
			msgType, message, err := c.ReadMessage()
			if msgType == -1 {
				_ = stream.Send(&grpc_v1.StreamRequest{
					Closed: true,
				})
				_ = stream.CloseSend()
				return io.EOF
			}
			if err != nil {
				errMsg := fmt.Sprintf("Failed to read from ws: %s", err.Error())
				t.Log.Warnf(errMsg)
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte(errMsg))
				return err
			}

			for _, b := range message {
				err = stream.Send(&grpc_v1.StreamRequest{
					Payload: []byte{b},
				})

				if err != nil {
					errMsg := fmt.Sprintf("Failed to send to gRPC: %s", err.Error())
					t.Log.Warn(errMsg)
					w.WriteHeader(http.StatusInternalServerError)
					w.Write([]byte(errMsg))
					return err
				}
			}
		}
	})

	g.Wait()
}
