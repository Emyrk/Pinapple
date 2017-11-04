package server

import (
	// "html/template"
	"os"
	"path/filepath"
)

var baseDir = filepath.Join(os.Getenv("GOPATH"), "src", "github.com", "Emyrk", "Pinapple", "static")

var clientTemplate = filepath.Join(baseDir, "client.html")
var loginTemplate = filepath.Join(baseDir, "login.html")

func SetBaseDir(dir string) {
	baseDir = dir
	clientTemplate = filepath.Join(baseDir, "client.html")
	loginTemplate = filepath.Join(baseDir, "login.html")
}
