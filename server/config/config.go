package config

import (
	"fmt"
	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v2"
	"os"
)

type Config struct {
	Server struct {
		Host string `yaml:"host" envconfig:"NU_SERVER_HOST"`
		Port int    `yaml:"port" envconfig:"NU_SERVER_PORT"`
	} `yaml:"server"`
	Auth struct {
		JwtKey string `yaml:"jwt_key" envconfig:"NU_JWT_KEY"`
	} `yaml:"auth"`
	Spotify struct {
		ClientId     string `yaml:"client_id" envconfig:"SP_CLIENT_ID"`
		ClientSecret string `yaml:"client_secret" envconfig:"SP_CLIENT_SECRET"`
		RedirectUri  string `yaml:"redirect_uri" envconfig:"SP_REDIRECT_URI"`
	} `yaml:"spotify"`
	Env string `yaml:"env" envconfig:"NU_ENV"`
}

func New() *Config {
	var v Config
	readFile(&v)
	readEnv(&v)
	return &v
}

func processError(err error) {
	fmt.Println(err)
	os.Exit(2)
}

func readFile(v *Config) {
	f, err := os.Open("config.yml")
	if err != nil {
		processError(err)
	}
	defer f.Close()

	decoder := yaml.NewDecoder(f)
	err = decoder.Decode(v)
	if err != nil {
		processError(err)
	}
}

func readEnv(v *Config) {
	err := envconfig.Process("", v)
	if err != nil {
		processError(err)
	}
}
