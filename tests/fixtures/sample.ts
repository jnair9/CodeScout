interface AuthService {
    verify(token: string): boolean;
}

class TokenManager {
    verifyToken(token: string): string {
        return token;
    }

    revokeToken(token: string): void {}
}

function standaloneFunction(x: number): number {
    return x + 1;
}
