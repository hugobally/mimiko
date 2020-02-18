package client

import (
	"net/http"
	"time"
)

func New() *http.Client {
	c := &http.Client{
		Timeout: 10 * time.Second,
	}
	return c
}
