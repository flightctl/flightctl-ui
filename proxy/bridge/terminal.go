package bridge

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc/metadata"

	grpc_v1 "github.com/flightctl/flightctl/api/grpc/v1"
	"github.com/gorilla/websocket"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

const (
	wsStandaloneSubprotocol = "flightctl.standalone.auth"
	wsOcpSubprotocol        = "flightctl.ocp.auth"
)

var upgrader = websocket.Upgrader{} // use default options

type TerminalBridge struct {
	ApiUrl    string
	TlsConfig *tls.Config
}

type GRPCEndpoint struct {
	GRPCEndpoint string `json:"gRPCEndpoint"`
	SessionID    string `json:"sessionID"`
}

func (b TerminalBridge) HandleTerminal(w http.ResponseWriter, r *http.Request) {
	deviceId, found := strings.CutPrefix(r.URL.Path, "/api/terminal/")
	if !found {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	client := &http.Client{Transport: &http.Transport{
		TLSClientConfig: b.TlsConfig,
	}}

	consoleUrl := b.ApiUrl + "/api/v1/devices/" + deviceId + "/console"
	resp, err := client.Get(consoleUrl)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Failed to get gRPC session: " + err.Error()))
		return
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to read response: " + err.Error()))
		return
	}
	if resp.StatusCode != http.StatusOK {
		w.WriteHeader(resp.StatusCode)
		w.Write(body)
		return
	}
	response := GRPCEndpoint{}
	if err := json.Unmarshal(body, &response); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to unmarshall response json: " + err.Error()))
		return
	}

	grpcEndpoint := strings.TrimPrefix(response.GRPCEndpoint, "grpcs://")
	grpcEndpoint = strings.TrimPrefix(grpcEndpoint, "grpc://")

	grpcClient, err := grpc.NewClient(grpcEndpoint, grpc.WithTransportCredentials(credentials.NewTLS(b.TlsConfig)))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to create gRPC client: " + err.Error()))
		return
	}

	router := grpc_v1.NewRouterServiceClient(grpcClient)

	ctx := metadata.AppendToOutgoingContext(r.Context(), "session-id", response.SessionID)
	ctx = metadata.AppendToOutgoingContext(ctx, "client-name", "flightctl-ui")
	g, ctx := errgroup.WithContext(ctx)

	stream, err := router.Stream(ctx)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to create gRPC stream: " + err.Error()))
		return
	}
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	upgrader.Subprotocols = []string{wsStandaloneSubprotocol, wsOcpSubprotocol}
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to update websocket: " + err.Error()))
		return
	}
	defer func() {
		c.Close()
		_ = stream.Send(&grpc_v1.StreamRequest{
			Closed: true,
		})
		_ = stream.CloseSend()
	}()

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
				return err
			}
			str := string(frame.Payload)
			// Probably we should use a pseudo tty on the other side
			// but this is good for now
			str = strings.ReplaceAll(str, "\n", "\n\r")
			err = c.WriteMessage(1, []byte(str))
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte("Failed to write to ws: " + err.Error()))
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
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte("Failed to read from ws: " + err.Error()))
				return err
			}

			for _, b := range message {
				err = stream.Send(&grpc_v1.StreamRequest{
					Payload: []byte{b},
				})

				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					w.Write([]byte("Failed to send to gRPC: " + err.Error()))
					return err
				}
			}
		}
	})

	g.Wait()
}
