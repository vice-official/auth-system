import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ message: "Выход выполнен успешно" }, { status: 200 })

  // Удаление cookie
  response.cookies.delete("auth-token")

  return response
}
