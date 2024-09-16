package server

import (
	"bytes"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type SpaHandler struct{}

func serveIndexPage(w http.ResponseWriter, r *http.Request) {
	content, err := os.ReadFile("./dist/index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	http.ServeContent(w, r, "index.html", time.Time{}, bytes.NewReader(content))

}

func (h SpaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var path string
	if strings.HasSuffix(r.URL.Path, "plugin__flightctl-plugin.json") {
		r.URL.Path = strings.Replace(r.URL.Path, "plugin__flightctl-plugin.json", "translation.json", 1)
	}
	path = filepath.Join("./dist", r.URL.Path)
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
	http.FileServer(http.Dir("./dist")).ServeHTTP(w, r)
}
