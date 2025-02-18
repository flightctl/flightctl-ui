package auth

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/openshift/osincli"
	log "github.com/sirupsen/logrus"
)

type LoginParameters struct {
	Code string `json:"code"`
}

func OAuthLogin(w http.ResponseWriter, r *http.Request, client *osincli.Client, internalClient *osincli.Client) {
	if r.Method == "POST" {
		token, err := exchangeToken(r, internalClient)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}
		SetCookie(w, token)
	} else {
		resp, err := loginRedirect(client)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}
		w.Write(resp)
	}
}

func exchangeToken(r *http.Request, client *osincli.Client) (string, error) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Warnf("Failed to read request body: %s", err.Error())
		return "", err
	}

	loginParams := LoginParameters{}
	err = json.Unmarshal(body, &loginParams)
	if err != nil {
		log.Warnf("Failed to unmarshall request body: %s", err.Error())
		return "", err
	}

	treq := client.NewAccessRequest(osincli.AUTHORIZATION_CODE, &osincli.AuthorizeData{
		Code: loginParams.Code,
	})

	// exchange the authorize token for the access token
	ad, err := treq.GetToken()
	if err != nil {
		log.Warnf("Failed to get token: %s", err.Error())
		return "", err
	}

	return ad.AccessToken, nil
}

func loginRedirect(client *osincli.Client) ([]byte, error) {
	authorizeRequest := client.NewAuthorizeRequest(osincli.CODE)
	loginUrl := authorizeRequest.GetAuthorizeUrl().String()
	response, err := json.Marshal(RedirectResponse{Url: loginUrl})
	if err != nil {
		log.Warnf("Failed to marshal response: %s", err.Error())
		return []byte{}, err
	}
	return response, nil
}
