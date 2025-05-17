package query

import (
	"context"
	"github.com/hugobally/mimiko/api/internal/authentication"
	"github.com/hugobally/mimiko/api/internal/db/models"
)

func (r *QueryResolver) Me(ctx context.Context) (*models.User, error) {
	id, err := authentication.UserIdFromContext(ctx)
	if err != nil {
		return nil, err
	}

	u, err := r.Database.FindUser(id)
	if err != nil {
		return nil, err
	}

	return u, nil
}
