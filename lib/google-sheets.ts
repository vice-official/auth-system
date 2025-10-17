import { google } from "googleapis"
import type { User } from "@/types/user"

export async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  const sheets = google.sheets({ version: "v4", auth })
  return sheets
}

export async function getUsers(): Promise<User[]> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Users!A2:E",
    })

    const rows = response.data.values || []
    return rows.map((row) => ({
      id: row[0],
      email: row[1],
      username: row[2],
      password: row[3],
      createdAt: row[4],
    }))
  } catch (error) {
    console.error("Error fetching users from Google Sheets:", error)
    return []
  }
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers()
  return users.find((user) => user.email === email)
}

export async function addUser(
  email: string,
  username: string,
  hashedPassword: string,
): Promise<Omit<User, "password">> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

  const id = Date.now().toString()
  const createdAt = new Date().toISOString()

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Users!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[id, email, username, hashedPassword, createdAt]],
      },
    })

    return { id, email, username, createdAt }
  } catch (error) {
    console.error("Error adding user to Google Sheets:", error)
    throw new Error("Failed to create user")
  }
}

export async function initializeSheet() {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Users!A1:E1",
    })

    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Users!A1:E1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["ID", "Email", "Username", "Password", "Created At"]],
        },
      })
    }
  } catch (error) {
    console.error("Error initializing sheet:", error)
  }
}
