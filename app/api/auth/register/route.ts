import { type NextRequest, NextResponse } from "next/server"
import { addUser, findUserByEmail, initializeSheet } from "@/lib/google-sheets"
import { hashPassword, createToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Валидация
    if (!email || !password) {
      return NextResponse.json({ error: "Email и пароль обязательны" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Пароль должен содержать минимум 6 символов" }, { status: 400 })
    }

    // Инициализация таблицы (если нужно)
    await initializeSheet()

    // Проверка существования пользователя
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 })
    }

    // Хеширование пароля и создание пользователя
    const hashedPassword = await hashPassword(password)
    const user = await addUser(email, hashedPassword)

    // Создание токена
    const token = await createToken(user.id, user.email)

    // Установка cookie с токеном
    const response = NextResponse.json(
      { message: "Регистрация успешна", user: { id: user.id, email: user.email } },
      { status: 201 },
    )

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    })

    return response
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Ошибка при регистрации" }, { status: 500 })
  }
}
