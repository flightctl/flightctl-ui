package bridge

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/flightctl/flightctl-ui/log"
)

type FieldValidation struct {
	Valid bool     `json:"valid"`
	Value string   `json:"value,omitempty"`
	Notes []string `json:"notes,omitempty"`
}

type TestConnectionRequest struct {
	ProviderType     string `json:"providerType"`
	Issuer           string `json:"issuer,omitempty"`
	AuthorizationUrl string `json:"authorizationUrl,omitempty"`
	TokenUrl         string `json:"tokenUrl,omitempty"`
	UserinfoUrl      string `json:"userinfoUrl,omitempty"`
	ClientId         string `json:"clientId,omitempty"`
}

type FieldValidationResult struct {
	Field string   `json:"field"`
	Valid bool     `json:"valid"`
	Value string   `json:"value,omitempty"`
	Notes []string `json:"notes,omitempty"`
}

type TestConnectionResponse struct {
	Results []FieldValidationResult `json:"results"`
}

type oidcDiscoveryDocument struct {
	Issuer                string `json:"issuer"`
	AuthorizationEndpoint string `json:"authorization_endpoint"`
	TokenEndpoint         string `json:"token_endpoint"`
	UserinfoEndpoint      string `json:"userinfo_endpoint"`
}

type TestAuthHandler struct {
	tlsConfig *tls.Config
}

func NewTestAuthHandler(tlsConfig *tls.Config) *TestAuthHandler {
	return &TestAuthHandler{
		tlsConfig: tlsConfig,
	}
}

func (h *TestAuthHandler) TestConnection(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req TestConnectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	response := TestConnectionResponse{
		Results: make([]FieldValidationResult, 0),
	}

	httpClient := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: h.tlsConfig,
		},
		Timeout: 10 * time.Second,
	}

	if req.ProviderType == "oidc" {
		h.validateOIDCProvider(&req, &response, httpClient)
	} else if req.ProviderType == "oauth2" {
		h.validateOAuth2Provider(&req, &response, httpClient)
	} else {
		http.Error(w, "Invalid provider type", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *TestAuthHandler) validateOIDCProvider(req *TestConnectionRequest, response *TestConnectionResponse, httpClient *http.Client) {
	if req.Issuer == "" {
		response.Results = append(response.Results, FieldValidationResult{
			Field: "issuer",
			Valid: false,
			Value: "",
			Notes: []string{"Issuer URL is required for OIDC providers"},
		})
		return
	}

	// Minimal SSRF protection for issuer URL
	if err := validateURLForSSRF(req.Issuer); err != nil {
		response.Results = append(response.Results, FieldValidationResult{
			Field: "issuer",
			Valid: false,
			Value: req.Issuer,
			Notes: []string{fmt.Sprintf("Issuer URL cannot be validated with this utility: %v", err)},
		})
		return
	}

	// Fetch OIDC discovery document
	discoveryUrl := fmt.Sprintf("%s/.well-known/openid-configuration", req.Issuer)
	httpReq, err := http.NewRequest(http.MethodGet, discoveryUrl, nil)
	if err != nil {
		response.Results = append(response.Results, FieldValidationResult{
			Field: "issuer",
			Valid: false,
			Value: req.Issuer,
			Notes: []string{fmt.Sprintf("Failed to create request: %v", err)},
		})
		return
	}

	resp, err := httpClient.Do(httpReq)
	if err != nil {
		response.Results = append(response.Results, FieldValidationResult{
			Field: "issuer",
			Valid: false,
			Value: req.Issuer,
			Notes: []string{fmt.Sprintf("Failed to fetch OIDC discovery document: %v", err)},
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		response.Results = append(response.Results, FieldValidationResult{
			Field: "issuer",
			Valid: false,
			Value: req.Issuer,
			Notes: []string{fmt.Sprintf("OIDC discovery endpoint returned status %d", resp.StatusCode)},
		})
		return
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		response.Results = append(response.Results, FieldValidationResult{
			Field: "issuer",
			Valid: false,
			Value: req.Issuer,
			Notes: []string{fmt.Sprintf("Failed to read discovery document: %v", err)},
		})
		return
	}

	var discovery oidcDiscoveryDocument
	if err := json.Unmarshal(bodyBytes, &discovery); err != nil {
		response.Results = append(response.Results, FieldValidationResult{
			Field: "issuer",
			Valid: false,
			Value: req.Issuer,
			Notes: []string{fmt.Sprintf("Failed to parse discovery document: %v", err)},
		})
		return
	}

	// Validate issuer field in discovery document
	issuerNotes := []string{}
	hasErrors := false

	if discovery.Issuer != req.Issuer {
		issuerNotes = append(issuerNotes, fmt.Sprintf("Discovery document issuer (%s) does not match provided issuer (%s)", discovery.Issuer, req.Issuer))
	}

	if discovery.AuthorizationEndpoint == "" {
		issuerNotes = append(issuerNotes, "Discovery document is missing authorization_endpoint")
		hasErrors = true
	}

	if discovery.TokenEndpoint == "" {
		issuerNotes = append(issuerNotes, "Discovery document is missing token_endpoint")
		hasErrors = true
	}

	if discovery.UserinfoEndpoint == "" {
		issuerNotes = append(issuerNotes, "Discovery document is missing userinfo_endpoint (optional)")
	}

	if !hasErrors && len(issuerNotes) == 0 {
		issuerNotes = append(issuerNotes, "Successfully discovered OIDC configuration from .well-known/openid_configuration")
	}

	// For OIDC: issuer first, then the rest
	response.Results = append(response.Results, FieldValidationResult{
		Field: "issuer",
		Valid: !hasErrors,
		Value: req.Issuer,
		Notes: issuerNotes,
	})

	// Verify the discovered endpoints are reachable
	// Skip SSRF validation since these come from the validated issuer
	if discovery.AuthorizationEndpoint != "" {
		validation := h.checkEndpointReachability(discovery.AuthorizationEndpoint, "Authorization endpoint", httpClient, false, true)
		response.Results = append(response.Results, FieldValidationResult{
			Field: "authorizationUrl",
			Valid: validation.Valid,
			Value: validation.Value,
			Notes: validation.Notes,
		})
	}

	if discovery.TokenEndpoint != "" {
		validation := h.checkEndpointReachability(discovery.TokenEndpoint, "Token endpoint", httpClient, true, true)
		response.Results = append(response.Results, FieldValidationResult{
			Field: "tokenUrl",
			Valid: validation.Valid,
			Value: validation.Value,
			Notes: validation.Notes,
		})
	}

	if discovery.UserinfoEndpoint != "" {
		validation := h.checkEndpointReachability(discovery.UserinfoEndpoint, "Userinfo endpoint", httpClient, false, true)
		response.Results = append(response.Results, FieldValidationResult{
			Field: "userinfoUrl",
			Valid: validation.Valid,
			Value: validation.Value,
			Notes: validation.Notes,
		})
	}
}

func (h *TestAuthHandler) validateOAuth2Provider(req *TestConnectionRequest, response *TestConnectionResponse, httpClient *http.Client) {
	// For OAuth2: other fields first, then issuer last
	if req.AuthorizationUrl != "" {
		validation := h.checkEndpointReachability(req.AuthorizationUrl, "Authorization URL", httpClient, false, false)
		response.Results = append(response.Results, FieldValidationResult{
			Field: "authorizationUrl",
			Valid: validation.Valid,
			Value: validation.Value,
			Notes: validation.Notes,
		})
	} else {
		response.Results = append(response.Results, FieldValidationResult{
			Field: "authorizationUrl",
			Valid: false,
			Value: "",
			Notes: []string{"Authorization URL is required"},
		})
	}

	if req.TokenUrl != "" {
		validation := h.checkEndpointReachability(req.TokenUrl, "Token URL", httpClient, true, false)
		response.Results = append(response.Results, FieldValidationResult{
			Field: "tokenUrl",
			Valid: validation.Valid,
			Value: validation.Value,
			Notes: validation.Notes,
		})
	} else {
		response.Results = append(response.Results, FieldValidationResult{
			Field: "tokenUrl",
			Valid: false,
			Value: "",
			Notes: []string{"Token URL is required"},
		})
	}

	if req.UserinfoUrl != "" {
		validation := h.checkEndpointReachability(req.UserinfoUrl, "Userinfo URL", httpClient, false, false)
		response.Results = append(response.Results, FieldValidationResult{
			Field: "userinfoUrl",
			Valid: validation.Valid,
			Value: validation.Value,
			Notes: validation.Notes,
		})
	} else {
		response.Results = append(response.Results, FieldValidationResult{
			Field: "userinfoUrl",
			Valid: false,
			Value: "",
			Notes: []string{"Userinfo URL is required"},
		})
	}

	// Validate issuer if provided (optional for OAuth2) - add last
	if req.Issuer != "" {
		validation := h.checkEndpointReachability(req.Issuer, "Issuer URL", httpClient, false, false)
		response.Results = append(response.Results, FieldValidationResult{
			Field: "issuer",
			Valid: validation.Valid,
			Value: validation.Value,
			Notes: validation.Notes,
		})
	}
}

// isPrivateIP checks if an IP address is in a private/local range
func isPrivateIP(ip net.IP) bool {
	if ip == nil {
		return false
	}
	if ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return true
	}
	return ip.IsPrivate()
}

// validateURLForSSRF performs minimal SSRF protection by blocking localhost and private IPs
func validateURLForSSRF(rawURL string) error {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return fmt.Errorf("invalid URL: %v", err)
	}

	host := parsed.Hostname()
	if host == "" {
		return fmt.Errorf("missing hostname")
	}

	// Check for localhost hostnames
	hostLower := strings.ToLower(host)
	if hostLower == "localhost" || strings.HasSuffix(hostLower, ".localhost") {
		return fmt.Errorf("localhost URLs are not allowed")
	}

	// Parse IP address if host is an IP
	if ip := net.ParseIP(host); ip != nil {
		if isPrivateIP(ip) {
			return fmt.Errorf("private IP addresses are not allowed")
		}
	}

	return nil
}

func (h *TestAuthHandler) checkEndpointReachability(urlStr string, fieldName string, httpClient *http.Client, isTokenEndpoint bool, skipSSRF bool) FieldValidation {
	// Minimal SSRF protection (skip for discovered endpoints from validated issuer)
	if !skipSSRF {
		if err := validateURLForSSRF(urlStr); err != nil {
			return FieldValidation{
				Valid: false,
				Value: urlStr,
				Notes: []string{fmt.Sprintf("%s: %v", fieldName, err)},
			}
		}
	}

	parsed, err := url.Parse(urlStr)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		return FieldValidation{
			Valid: false,
			Value: urlStr,
			Notes: []string{fmt.Sprintf("%s must be a valid http(s) URL", fieldName)},
		}
	}
	req, err := http.NewRequest(http.MethodGet, parsed.String(), nil)
	if err != nil {
		return FieldValidation{
			Valid: false,
			Value: urlStr,
			Notes: []string{fmt.Sprintf("Failed to create request: %v", err)},
		}
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		log.GetLogger().Warnf("Endpoint test failed for %s: %v", urlStr, err)
		return FieldValidation{
			Valid: false,
			Value: urlStr,
			Notes: []string{fmt.Sprintf("%s is not reachable: %v", fieldName, err)},
		}
	}
	defer resp.Body.Close()

	// Evaluate endpoint reachability based on HTTP status
	notes := []string{}
	valid := true

	if resp.StatusCode >= 200 && resp.StatusCode < 500 {
		// 2xx, 3xx, 4xx: endpoint is reachable
		if resp.StatusCode == http.StatusNotFound {
			// 404 on token endpoints is acceptable (they only accept POST)
			// 404 on other endpoints means not found
			if isTokenEndpoint {
				notes = append(notes, fmt.Sprintf("%s is reachable (HTTP 404 for GET - endpoint likely accepts POST)", fieldName))
			} else {
				notes = append(notes, fmt.Sprintf("%s returned HTTP 404 - endpoint not found", fieldName))
				valid = false
			}
		} else if resp.StatusCode == http.StatusMethodNotAllowed {
			// 405 Method Not Allowed - endpoint exists but GET not supported (expected for some endpoints)
			notes = append(notes, fmt.Sprintf("%s is reachable (HTTP 405 - endpoint exists, GET not supported)", fieldName))
		} else if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
			// 401/403 - endpoint exists and requires authentication (expected)
			notes = append(notes, fmt.Sprintf("%s is reachable (HTTP %d - authentication required, as expected)", fieldName, resp.StatusCode))
		} else if resp.StatusCode == http.StatusBadRequest {
			// 400 - endpoint exists but request is invalid (expected without auth)
			notes = append(notes, fmt.Sprintf("%s is reachable (HTTP 400 - endpoint exists)", fieldName))
		} else {
			// All other 2xx, 3xx, 4xx responses indicate the endpoint is reachable
			notes = append(notes, fmt.Sprintf("%s is reachable (HTTP %d)", fieldName, resp.StatusCode))
		}
	} else {
		// 5xx server errors
		notes = append(notes, fmt.Sprintf("%s returned HTTP %d - server error", fieldName, resp.StatusCode))
		valid = false
	}

	return FieldValidation{
		Valid: valid,
		Value: urlStr,
		Notes: notes,
	}
}
