package auth

import (
	"errors"
	"fmt"
	"reflect"
	"strconv"

	"github.com/openshift/osincli"
)

func exchangeToken(loginParams LoginParameters, client *osincli.Client) (TokenData, *int64, error) {
	req := client.NewAccessRequest(osincli.AUTHORIZATION_CODE, &osincli.AuthorizeData{
		Code: loginParams.Code,
	})

	return executeOAuthFlow(req)
}

func refreshOAuthToken(refreshToken string, client *osincli.Client) (TokenData, *int64, error) {
	req := client.NewAccessRequest(osincli.REFRESH_TOKEN, &osincli.AuthorizeData{Code: refreshToken})
	return executeOAuthFlow(req)
}

func loginRedirect(client *osincli.Client) string {
	authorizeRequest := client.NewAuthorizeRequest(osincli.CODE)
	return authorizeRequest.GetAuthorizeUrl().String()
}

func executeOAuthFlow(req *osincli.AccessRequest) (TokenData, *int64, error) {
	ret := TokenData{}
	// Exchange refresh token for a new access token
	accessData, err := req.GetToken()
	if err != nil {
		return ret, nil, fmt.Errorf("failed to execute oAuth request: %w", err)
	}

	expiresIn, err := getExpiresIn(accessData.ResponseData)
	if err != nil {
		return ret, nil, fmt.Errorf("failed to get token expiration: %w", err)
	}

	ret.Token = accessData.AccessToken
	ret.RefreshToken = accessData.RefreshToken // May be empty if not returned

	return ret, expiresIn, nil
}

// based on GetToken() from osincli which parses the expires_in to int32 that may overflow
func getExpiresIn(ret osincli.ResponseData) (*int64, error) {
	expires_in_raw, ok := ret["expires_in"]
	if ok {
		rv := reflect.ValueOf(expires_in_raw)
		switch rv.Kind() {
		case reflect.Float64:
			expiration := int64(rv.Float())
			return &expiration, nil
		case reflect.String:
			// if string convert to integer
			ei, err := strconv.ParseInt(rv.String(), 10, 64)
			if err != nil {
				return nil, err
			}
			return &ei, nil
		default:
			return nil, errors.New("invalid parameter value")
		}
	}
	return nil, nil
}
