package mutation

import (
	"context"
	"github.com/hugobally/mimiko/server/gql/models"
	"github.com/hugobally/mimiko/server/prisma"
)

// TODO Create methods : factorize

// TODO Handle errors properly
// Map id empty
func (r *Resolver) CreateKnots(ctx context.Context, mapId string, inputs []models.KnotInput) ([]prisma.Knot, error) {
	var newKnots []prisma.Knot
	for _, input := range inputs {
		if input.TrackId == nil || input.Level == nil {
			continue
		}

		knot, err := r.Prisma.CreateKnot(prisma.KnotCreateInput{
			Map: prisma.MapCreateOneWithoutKnotsInput{
				Connect: &prisma.MapWhereUniqueInput{
					ID: &mapId,
				},
			},
			TrackId: *input.TrackId,
			Level: *input.Level,
			Visited: input.Visited,
		}).Exec(ctx)
		if err != nil {
			return newKnots, err
		}
		newKnots = append(newKnots, *knot)
	}
	return newKnots, nil
}

func (r *Resolver) UpdateKnot(ctx context.Context, knotId string, input models.KnotInput) (*prisma.Knot, error) {
	return r.Prisma.UpdateKnot(prisma.KnotUpdateParams{
		Data:  prisma.KnotUpdateInput{
			Visited: input.Visited,
		},
		Where: prisma.KnotWhereUniqueInput{
			ID: &knotId,
		},
	}).Exec(ctx)
}

// TODO Delete : factorize with function generator

func (r *Resolver) DeleteKnots(ctx context.Context, mapId string, knotIds []string) (*models.MutationResult, error) {
	res, err := r.Prisma.DeleteManyKnots(&prisma.KnotWhereInput{
		IDIn: knotIds,
		Map:  &prisma.MapWhereInput{ID: &mapId},
	}).Exec(ctx)

	if err != nil {
		return &models.MutationResult{Success: false, Count: 0}, err
	}

	return &models.MutationResult{Success: true, Count: int(res.Count)}, nil
}
