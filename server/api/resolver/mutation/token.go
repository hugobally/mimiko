package mutation

import (
	"context"
	"errors"
	"github.com/hugobally/mimiko/server/auth"
	"github.com/hugobally/mimiko/server/prisma"
	"time"
)

//TODO If Username has changed on the remote app, update it here
func (r *Resolver) GetToken(ctx context.Context, appType prisma.AppType) (*prisma.LinkedApp, error) {
	// TODO Authorization

	user, err := auth.GetUserFromContext(ctx)
	if err != nil {
		return nil, err
	}

	apps, err := r.Prisma.LinkedApps(&prisma.LinkedAppsParams{
		Where:   &prisma.LinkedAppWhereInput{
			User:  &prisma.UserWhereInput{ID: &user.ID},
			Type: &appType,
		},
	}).Exec(ctx)

	if err != nil {
		return nil, err
	}
	if len(apps) == 0 {
		return nil, errors.New("no linked app found for the user")
	}

	app := &apps[0]
	exp, _ := time.Parse(time.RFC3339, *app.TokenExpiry)

	if exp.Before(time.Now().Add(5 * time.Minute)) {
		newToken, err := r.Spotify.RefreshToken(*app.RefreshToken)
		if err != nil {
			return nil, err
		}

		expStr := time.Now().Add(time.Duration(newToken.ExpiresIn) * time.Second).Format(time.RFC3339)
		var refreshToken *string
		if newToken.RefreshToken != "" {
			refreshToken = &newToken.RefreshToken
		} else { refreshToken = app.RefreshToken }

		app, err = r.Prisma.UpdateLinkedApp(prisma.LinkedAppUpdateParams{
			Data:  prisma.LinkedAppUpdateInput{
				AccessToken: &newToken.AccessToken,
				TokenExpiry: &expStr,
				RefreshToken: refreshToken,
			},
			Where: prisma.LinkedAppWhereUniqueInput{
					ID: &app.ID,
			},
		}).Exec(ctx)
		if err != nil {
			return nil, err
		}
	}
	return app, nil
}
