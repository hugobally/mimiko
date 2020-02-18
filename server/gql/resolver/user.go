package resolver

import (
	"context"
	"github.com/hugobally/mimiko/server/prisma"
)

type userResolver struct{ *Resolver }

func (r *userResolver) Maps(ctx context.Context, obj *prisma.User) ([]prisma.Map, error) {
	return r.Prisma.User(prisma.UserWhereUniqueInput{
		ID: &obj.ID,
	}).Maps(nil).Exec(ctx)
}

func (r *userResolver) LinkedApps(ctx context.Context, obj *prisma.User, typeArg *prisma.AppType) ([]prisma.LinkedApp, error) {
	return r.Prisma.LinkedApps(&prisma.LinkedAppsParams{
		Where: &prisma.LinkedAppWhereInput{
			User: &prisma.UserWhereInput{ID:&obj.ID},
			Type: typeArg,
		},
	}).Exec(ctx)
}
