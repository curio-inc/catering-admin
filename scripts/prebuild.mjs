import { execSync } from "node:child_process"
import { rm } from "node:fs/promises"

/** build 前に dev を止め .next を削除（dev/build 同時実行によるチャンク破損を防ぐ） */
try {
  execSync('pkill -f "next/dist/bin/next" 2>/dev/null || true', { stdio: "ignore" })
} catch {}

await rm(".next", { recursive: true, force: true })
console.log("[prebuild] stopped dev servers and cleaned .next")
