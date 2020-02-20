package static

import (
	"github.com/hugobally/mimiko/backend/shared"
	"net/http"
)

type Handler struct{ *shared.Services }

func (h *Handler) SetupRoutes(mux *http.ServeMux) {
	mux.Handle("/", http.FileServer(http.Dir(h.Config.Server.StaticPath)))
}

func NewHandler(s *shared.Services) *Handler {
	return &Handler{s}
}
