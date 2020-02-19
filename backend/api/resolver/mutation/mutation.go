package mutation

import (
	"github.com/hugobally/mimiko/backend/shared"
)

type Resolver struct{ *shared.Services }

func New(s *shared.Services) *Resolver {
	return &Resolver{s}
}
