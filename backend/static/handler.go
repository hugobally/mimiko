package static

import (
	"github.com/hugobally/mimiko/backend/shared"
	"net/http"
)

type Handler struct{ *shared.Services }

func NewHandler(s *shared.Services) *Handler {
	return &Handler{s}
}

func (h *Handler) SetupRoutes(mux *http.ServeMux) {
	mux.Handle("/", WrapNotFound(http.FileServer(http.Dir(h.Config.Server.StaticPath))))
}

// Vue Frontend requires 404's on static assets to return index.html instead
func WrapNotFound(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cw := &CustomResponseWriter{ResponseWriter: w}
		next.ServeHTTP(w, r)
		if cw.status == http.StatusNotFound {
			http.ServeFile(w, r, "/")
		}
	}
}

type CustomResponseWriter struct {
	http.ResponseWriter
	status int
}

func (w *CustomResponseWriter) WriteHeader(status int) {
	if status != http.StatusNotFound {
		w.ResponseWriter.WriteHeader(status)
	} else {
		w.status = status
	}
}

func (w *CustomResponseWriter) Write(p []byte) (int, error) {
	if w.status != http.StatusNotFound {
		return w.ResponseWriter.Write(p)
	} else {
		return len(p), nil
	}
}
