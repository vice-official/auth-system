"use server"

import bcrypt from "bcryptjs"
import { findUserByEmail, addUser } from "@/lib/google-sheets"
import { createSession, deleteSession } from "@/lib/session"
import { validateEmail, validatePassword, validateUsername } from "@/lib/validation"
import { redirect } from "next/navigation"

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // Validation
  if (!validateEmail(email)) {
    return { error: "Неверный формат email" }
  }

  if (!validateUsername(username)) {
    return { error: "Имя пользователя должно быть от 3 до 20 символов" }
  }

  if (!validatePassword(password)) {
    return { error: "Пароль должен содержать минимум 8 символов" }
  }

  // Check if user exists
  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    return { error: "Пользователь с таким email уже существует" }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  try {
    const user = await addUser(email, username, hashedPassword)
    await createSession({ id: user.id, email: user.email, username: user.username })
    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Ошибка при создании пользователя" }
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!validateEmail(email)) {
    return { error: "Неверный формат email" }
  }

  const user = await findUserByEmail(email)
  if (!user) {
    return { error: "Неверный email или пароль" }
  }

  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    return { error: "Неверный email или пароль" }
  }

  await createSession({ id: user.id, email: user.email, username: user.username })
  return { success: true }
}

export async function logoutAction() {
  await deleteSession()
  redirect("/")
}
