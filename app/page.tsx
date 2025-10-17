import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-end">
        <ThemeToggle />
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <h1 className="text-5xl font-bold tracking-tight text-balance">Добро пожаловать!</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto text-pretty">
            Современная система авторизации с использованием Google Sheets API
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Регистрация</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
