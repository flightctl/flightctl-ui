package server

import (
	"bytes"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/flightctl/flightctl-ui/utils"
)

type SpaHandler struct{}

func serveIndexPage(w http.ResponseWriter, r *http.Request) {
	content, err := os.ReadFile("../dist/index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	strContent := string(content)
	script := "<script>\n" +
		"window.KEYCLOAK_AUTHORITY = \"" + utils.GetEnvVar("KEYCLOAK_AUTHORITY", "") + "\"\n" +
		"window.KEYCLOAK_CLIENTID = \"" + utils.GetEnvVar("KEYCLOAK_CLIENTID", "") + "\"\n" +
		"window.KEYCLOAK_REDIRECT = \"" + utils.GetEnvVar("KEYCLOAK_REDIRECT", "") + "\"\n" +
		"</script>"
	index := strings.Replace(strContent, "<head>", "<head>"+script, 1)
	http.ServeContent(w, r, "index.html", time.Time{}, bytes.NewReader([]byte(index)))

}

func (h SpaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := filepath.Join("../dist", r.URL.Path)
	fi, err := os.Stat(path)
	if os.IsNotExist(err) || fi.IsDir() || path == "index.html" {
		serveIndexPage(w, r)
		return
	}

	if err != nil {
		// if we got an error (that wasn't that the file doesn't exist) stating the
		// file, return a 500 internal server error and stop
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// otherwise, use http.FileServer to serve the static file
	http.FileServer(http.Dir("../dist")).ServeHTTP(w, r)
}
