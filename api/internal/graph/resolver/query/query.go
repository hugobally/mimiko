package query

import (
	"github.com/hugobally/mimiko/api/internal/shared"
)

type QueryResolver struct {
	*shared.Services
}

func NewQueryResolver(s *shared.Services) *QueryResolver {
	return &QueryResolver{s}
}
