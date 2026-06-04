import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

if (process.platform === "darwin" && process.arch === "arm64") {
  const binary = join(root, "node_modules/@next/swc-darwin-arm64/next-swc.darwin-arm64.node")
  if (!existsSync(binary)) {
    console.error(
      "\n[catering-admin] Next.js の SWC バイナリがありません。開発サーバーが起動しません。\n" +
        "  対処: rm -rf node_modules/@next/swc-darwin-arm64 && npm install\n",
    )
    process.exit(1)
  }
}
