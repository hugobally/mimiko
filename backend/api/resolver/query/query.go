package query

import (
	"context"
	"github.com/hugobally/mimiko/backend/auth"
	"github.com/hugobally/mimiko/backend/prisma"
)

type Resolver struct {
	Prisma *prisma.Client
}

func (r *Resolver) Me(ctx context.Context) (*prisma.User, error) {
	ctxUser, err := auth.GetUserFromContext(ctx)
	if err != nil {
		return nil, err
	}

	return r.Prisma.User(prisma.UserWhereUniqueInput{
		ID: &ctxUser.ID,
	}).Exec(ctx)
}

func NewResolver(p *prisma.Client) *Resolver {
	return &Resolver{Prisma: p}
}
