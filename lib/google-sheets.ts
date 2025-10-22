// lib/google-sheets.ts
import { GoogleSpreadsheet } from "google-spreadsheet";
import type { User } from "@/types/user";

// Получаем переменные окружения
const SHEET_ID =
  process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.warn("⚠️ Missing Google Sheets environment variables");
}

async function getDoc() {
  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error("Missing Google Sheets environment variables");
  }

  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY,
  });

  await doc.loadInfo();
  return doc;
}

async function getSheet() {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["Users"];
  if (!sheet) throw new Error("Sheet 'Users' not found");
  return sheet;
}

// Получить всех пользователей
export async function getUsers(): Promise<User[]> {
  try {
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    return rows.map((row) => ({
      id: row.ID,
      email: row.Email,
      username: row.Username,
      password: row.Password,
      createdAt: row["Created At"],
    }));
  } catch (err) {
    console.error("Error fetching users:", err);
    return [];
  }
}

// Найти пользователя по email
export async function findUserByEmail(
  email: string
): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.email === email);
}

// Добавить нового пользователя
export async function addUser(
  email: string,
  username: string,
  hashedPassword: string
): Promise<Omit<User, "password">> {
  const id = Date.now().toString();
  const createdAt = new Date().toISOString();

  try {
    const sheet = await getSheet();
    await sheet.addRow({
      ID: id,
      Email: email,
      Username: username,
      Password: hashedPassword,
      "Created At": createdAt,
    });
    return { id, email, username, createdAt };
  } catch (err) {
    console.error("Error adding user:", err);
    throw new Error("Failed to create user");
  }
}

// Инициализация шапки таблицы (если пустая)
export async function initializeSheet() {
  try {
    const doc = await getDoc();
    let sheet = doc.sheetsByTitle["Users"];
    if (!sheet) {
      sheet = await doc.addSheet({
        title: "Users",
        headerValues: ["ID", "Email", "Username", "Password", "Created At"],
      });
    }
  } catch (err) {
    console.error("Error initializing sheet:", err);
  }
}
