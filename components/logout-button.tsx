"use client"

export function LogoutButton() {
  return (
    <form action="/admin/logout" method="POST">
      <button
        type="submit"
        className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
      >
        ログアウト
      </button>
    </form>
  )
}
