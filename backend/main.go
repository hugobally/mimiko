package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/hugobally/mimiko/backend/auth/jwt"
	"github.com/hugobally/mimiko/backend/auth/login"
	"github.com/hugobally/mimiko/backend/client"
	"github.com/hugobally/mimiko/backend/config"
	"github.com/hugobally/mimiko/backend/prisma"
	"github.com/hugobally/mimiko/backend/shared"
	"github.com/hugobally/mimiko/backend/spotify"

	"github.com/gorilla/handlers"
	"github.com/hugobally/mimiko/backend/api"
	"github.com/hugobally/mimiko/backend/server"
)

func initSharedServices() *shared.Services {
	cfg := config.New()
	httpClient := client.New()
	logger := log.New(os.Stdout, "mimiko/backend ", log.LstdFlags|log.Lshortfile)
	prismaClient := prisma.New(nil)
	jwtUtil := jwt.NewJwtHandler(cfg.Auth.JwtKey)

	svcs := shared.NewServices()

	svcs.SetConfig(cfg)
	svcs.SetHttpClient(httpClient)
	svcs.SetLogger(logger)
	svcs.SetPrisma(prismaClient)
	svcs.SetJwtUtil(jwtUtil)

	sp := spotify.New(cfg, httpClient)
	svcs.SetSpotify(sp)

	return svcs
}

// TODO Implement TLS and ListenAndServeTLS > Switch JWT cookie to secure
func main() {
	svcs := initSharedServices()

	mux := http.NewServeMux()

	loginHandler := login.NewHandler(svcs)
	loginHandler.SetupRoutes(mux)

	gqlHandler := api.NewHandler(svcs)
	gqlHandler.SetupRoutes(mux)

	cfg := svcs.Config
	addr := fmt.Sprintf("%v:%d", cfg.Server.Host, cfg.Server.Port)

	muxWithMiddleware := handlers.LoggingHandler(os.Stdout, mux)
	srv := server.New(muxWithMiddleware, addr)

	svcs.Logger.Printf("server starting at %v", addr)
	err := srv.ListenAndServe()
	if err != nil {
		svcs.Logger.Fatalf("server failed to start: %v", err)
	}
}
