package resolver

import (
	"github.com/hugobally/mimiko/backend/api/gqlgen"
	"github.com/hugobally/mimiko/backend/api/resolver/mutation"
	"github.com/hugobally/mimiko/backend/api/resolver/query"
	"github.com/hugobally/mimiko/backend/shared"
)

type Resolver struct{ *shared.Services }

func New(s *shared.Services) *Resolver {
	return &Resolver{s}
}

func (r *Resolver) Mutation() gqlgen.MutationResolver {
	return mutation.New(r.Services)
}

func (r *Resolver) Query() gqlgen.QueryResolver {
	return query.NewResolver(r.Prisma)
}

func (r *Resolver) Map() gqlgen.MapResolver {
	return &mapResolver{r}
}

func (r *Resolver) User() gqlgen.UserResolver {
	return &userResolver{r}
}
