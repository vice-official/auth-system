"use client"

import { Button } from "@/components/ui/button"
import { logoutAction } from "@/server/actions/auth"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline" size="sm">
        <LogOut className="h-4 w-4 mr-2" />
        Выйти
      </Button>
    </form>
  )
}
