package mutation

import (
	"context"
	"github.com/hugobally/mimiko/server/auth"
	"github.com/hugobally/mimiko/server/input"
	"github.com/hugobally/mimiko/server/prisma"
)

// TODO Unique usernames
func (r *Resolver) UpdateUsername(ctx context.Context, newUsername string) (*prisma.User, error) {
	err := input.Length(newUsername, 3, 30)
	if err != nil {
		return nil, err
	}
	err = input.AlphaNum(newUsername)
	if err != nil {
		return nil, err
	}

	user, err := auth.GetUserFromContext(ctx)
	if err != nil {
		return nil, err
	}

	return r.Prisma.UpdateUser(prisma.UserUpdateParams{
		Data:  prisma.UserUpdateInput{
			Username: &newUsername,
		},
		Where: prisma.UserWhereUniqueInput{
			ID: &user.ID,
		},
	}).Exec(ctx)
}
