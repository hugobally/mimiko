package gql

import (
	"github.com/hugobally/mimiko/server/auth"
	"github.com/hugobally/mimiko/server/shared"
	"net/http"

	"github.com/hugobally/mimiko/server/gql/gqlgen"
	"github.com/hugobally/mimiko/server/gql/resolver"

	"github.com/99designs/gqlgen/handler"
)

type Handler struct{ *shared.Services }

func (h *Handler) SetupRoutes(mux *http.ServeMux) {
	r := resolver.New(h.Services)

	gqlHandler := handler.GraphQL(gqlgen.NewExecutableSchema(gqlgen.Config{Resolvers: r}))

	mux.Handle("/graphql", auth.NewMiddleware(gqlHandler, h.Services))

	//TODO Do not use in production as-is
	// It has no restricted access
	mux.HandleFunc("/",
		handler.Playground(
			"GraphQL Playground",
			"/query"),
	)
}

func NewHandler(s *shared.Services) *Handler {
	return &Handler{s}
}
