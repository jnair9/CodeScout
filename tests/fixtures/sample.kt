class TokenManager {
    fun verifyToken(token: String): String {
        return token
    }

    fun revokeToken(token: String) {}
}

object AuthSingleton {}

fun standaloneFunction(x: Int): Int {
    return x + 1
}
