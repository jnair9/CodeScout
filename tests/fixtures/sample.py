class TokenManager:
    def verify_token(self, token: str) -> dict:
        return {"user": token}

    def revoke_token(self, token: str) -> None:
        pass

def standalone_function(x: int) -> int:
    return x + 1
