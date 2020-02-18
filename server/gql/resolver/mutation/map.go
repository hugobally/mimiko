package mutation

import (
	"context"
	"errors"
	"github.com/hugobally/mimiko/server/auth"
	"github.com/hugobally/mimiko/server/gql/models"
	"github.com/hugobally/mimiko/server/input"
	"github.com/hugobally/mimiko/server/prisma"
)

func validateMapTitle(title *string) error {
	if title == nil {
		return nil
	}

	err := input.Length(*title, 1, 80)
	if err != nil {
		return err
	}
	err = input.AlphaNumSpace(*title)
	if err != nil {
		return err
	}

	return nil
}

func (r *Resolver) CreateMap(ctx context.Context, mapInput models.MapInput) (*prisma.Map, error) {
	err := validateMapTitle(mapInput.Title)
	if err != nil {
		return nil, err
	}

	user, err := auth.GetUserFromContext(ctx)
	if err != nil {
		return nil, err
	}

	if mapInput.FlagshipId == nil {
		return nil, errors.New("missing flagship track")
	}

	createParams := prisma.MapCreateInput{
		Author: prisma.UserCreateOneWithoutMapsInput{
			Connect: &prisma.UserWhereUniqueInput{
				ID: &user.ID,
			},
		},
		Title: mapInput.Title,
		Public: mapInput.Public,
		FlagshipId: mapInput.FlagshipId,
		Knots: &prisma.KnotCreateManyWithoutMapInput{
			Create: []prisma.KnotCreateWithoutMapInput{
				{
					TrackId: *mapInput.FlagshipId,
					Level:   0,
				},
			},
		},
	}

	return r.Prisma.CreateMap(createParams).Exec(ctx)
}

func (r *Resolver) UpdateMap(ctx context.Context, mapId string, mapInput models.MapInput) (*prisma.Map, error) {
	err := validateMapTitle(mapInput.Title)
	if err != nil {
		return nil, err
	}

	return r.Prisma.UpdateMap(prisma.MapUpdateParams{
		Data:  prisma.MapUpdateInput{
			Title: mapInput.Title,
			FlagshipId: mapInput.FlagshipId,
			Public: mapInput.Public,
		},
		Where: prisma.MapWhereUniqueInput{
			ID: &mapId,
		},
	}).Exec(ctx)
}

func (r *Resolver) DeleteMap(ctx context.Context, mapId string) (*models.MutationResult, error) {
	_, err := r.Prisma.DeleteMap(prisma.MapWhereUniqueInput{
		ID: &mapId,
	}).Exec(ctx)

	if err != nil {
		return &models.MutationResult{Success: false}, err
	}

	return &models.MutationResult{Success: true}, nil
}