import * as bcrypt from "bcrypt-ts"
import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
)

// Хеширование пароля (edge-safe)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Проверка пароля (edge-safe)
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Создание JWT токена
export async function createToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

// Проверка JWT токена
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string; email: string }
  } catch (error) {
    console.error("[auth] Token verification failed:", error)
    return null
  }
}
