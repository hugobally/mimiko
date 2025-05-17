package cert

import (
	"fmt"
	"os"
	"os/exec"
)

// GenerateSelfSignedCert generates a self-signed certificate and private key
// using OpenSSL and saves them to the specified directory
func GenerateSelfSignedCert(certPath string, keyPath string) error {
	// Check if certificates already exist
	if _, err := os.Stat(certPath); err == nil {
		if _, err := os.Stat(keyPath); err == nil {
			return nil
		}
	}

	// Generate private key and certificate using OpenSSL
	cmd := exec.Command("openssl", "req", "-x509",
		"-newkey", "rsa:4096",
		"-keyout", keyPath,
		"-out", certPath,
		"-days", "365",
		"-nodes",
		"-subj", "/CN=localhost",
		"-addext", "subjectAltName=DNS:localhost,IP:127.0.0.1")

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to generate certificates: %w", err)
	}

	return nil
}
