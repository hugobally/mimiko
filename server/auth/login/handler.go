package login

import (
	"github.com/hugobally/mimiko/server/shared"
	"net/http"
)

type Handler struct { *shared.Services }

func (h *Handler) SetupRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/login", h.Login)
	mux.HandleFunc("/logout", h.Logout)
}

func NewHandler(s *shared.Services) *Handler {
	return &Handler{ s }
}
