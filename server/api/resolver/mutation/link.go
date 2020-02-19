package mutation

import (
	"context"
	"github.com/hugobally/mimiko/server/api/models"
	"github.com/hugobally/mimiko/server/prisma"
)

// TODO Handle errors properly
func (r *Resolver) CreateLinks(ctx context.Context, mapID string, sourceID string, targetIds []string) ([]prisma.Link, error) {
	var newLinks []prisma.Link
	for _, targetId := range targetIds {
		link, err := r.Prisma.CreateLink(prisma.LinkCreateInput{
			Map: prisma.MapCreateOneWithoutLinksInput{
				Connect: &prisma.MapWhereUniqueInput{
					ID: &mapID,
				},
			},
			Source: sourceID,
			Target: targetId,
		}).Exec(ctx)
		if err != nil {
			return newLinks, err
		}
		newLinks = append(newLinks, *link)
	}
	return newLinks, nil
}

func (r *Resolver) DeleteLinks(ctx context.Context, mapId string, linkIds []string) (*models.MutationResult, error) {
	res, err := r.Prisma.DeleteManyLinks(&prisma.LinkWhereInput{
		IDIn: linkIds,
		Map:  &prisma.MapWhereInput{ID: &mapId},
	}).Exec(ctx)

	if err != nil {
		return &models.MutationResult{Success: false}, err
	}

	return &models.MutationResult{Success: true, Count: int(res.Count)}, nil
}

//func (r *Resolver) ConnectKnots(ctx context.Context, mapID string, knotIds []string) ([]prisma.Link, error) {
//	var newLinks []prisma.Link
//	var previous string
//
//	for i, id := range knotIds {
//		if i != 0 {
//			link, err := r.Prisma.CreateLink(prisma.LinkCreateInput{
//				Map: prisma.MapCreateOneWithoutLinksInput{
//					Connect: &prisma.MapWhereUniqueInput{
//						ID: &mapID,
//					},
//				},
//				Source: previous,
//				Target: id,
//			}).Exec(ctx)
//			if err != nil {
//				return newLinks, err
//			}
//
//			newLinks = append(newLinks, *link)
//		}
//
//		previous = id
//	}
//	return newLinks, nil
//}
