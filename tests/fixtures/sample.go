package main

type TokenManager struct{}

func StandaloneFunction(x int) int {
	return x + 1
}

func (t TokenManager) VerifyToken(token string) string {
	return token
}

func (t TokenManager) RevokeToken(token string) {}
