import type { User } from "@/types/user"

// базовая функция для обращения к Google Sheets API через fetch
async function fetchGoogleSheets(
  range: string,
  method: "GET" | "POST" | "PUT",
  body?: any
) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY

  if (!spreadsheetId || !apiKey)
    throw new Error("Missing Google Sheets environment variables")

  const urlBase = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`

  const url =
    method === "POST"
      ? `${urlBase}:append?valueInputOption=USER_ENTERED&key=${apiKey}`
      : `${urlBase}?key=${apiKey}`

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google Sheets API error: ${res.status} ${text}`)
  }

  return await res.json()
}

// Получить всех пользователей
export async function getUsers(): Promise<User[]> {
  try {
    const data = await fetchGoogleSheets("Users!A2:E", "GET")
    const rows = data.values || []
    return rows.map((row: string[]) => ({
      id: row[0],
      email: row[1],
      username: row[2],
      password: row[3],
      createdAt: row[4],
    }))
  } catch (err) {
    console.error("Error fetching users:", err)
    return []
  }
}

// Найти пользователя по email
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers()
  return users.find((u) => u.email === email)
}

// Добавить нового пользователя
export async function addUser(
  email: string,
  username: string,
  hashedPassword: string
): Promise<Omit<User, "password">> {
  const id = Date.now().toString()
  const createdAt = new Date().toISOString()

  try {
    await fetchGoogleSheets("Users!A:E", "POST", {
      values: [[id, email, username, hashedPassword, createdAt]],
    })
    return { id, email, username, createdAt }
  } catch (err) {
    console.error("Error adding user:", err)
    throw new Error("Failed to create user")
  }
}

// Инициализация шапки таблицы
export async function initializeSheet() {
  try {
    const data = await fetchGoogleSheets("Users!A1:E1", "GET")
    if (!data.values || data.values.length === 0) {
      await fetchGoogleSheets("Users!A1:E1", "PUT", {
        values: [["ID", "Email", "Username", "Password", "Created At"]],
      })
    }
  } catch (err) {
    console.error("Error initializing sheet:", err)
  }
}
