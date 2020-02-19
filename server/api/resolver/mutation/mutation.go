package mutation

import (
	"github.com/hugobally/mimiko/server/shared"
)

type Resolver struct{ *shared.Services }

func New(s *shared.Services) *Resolver {
	return &Resolver{s}
}
