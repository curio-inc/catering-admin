import { access, readFile, rm, unlink, writeFile } from "node:fs/promises"
import net from "node:net"
import { execSync } from "node:child_process"
import { spawn } from "node:child_process"

const preferredPorts = [3000, 3001, 3002, 3003, 3340]
const pidFile = ".dev-server.pid.json"

function hasFlag(name) {
  return process.argv.includes(name)
}

async function pathExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function isPortFree(port) {
  return await new Promise((resolve) => {
    const s = net
      .createServer()
      .once("error", () => resolve(false))
      .once("listening", () => s.close(() => resolve(true)))
      .listen(port, "0.0.0.0")
  })
}

async function pickPort() {
  for (const port of preferredPorts) {
    if (await isPortFree(port)) return port
  }
  return null
}

async function readTrackedPid() {
  try {
    const raw = await readFile(pidFile, "utf8")
    const data = JSON.parse(raw)
    if (typeof data?.pid === "number" && Number.isFinite(data.pid)) return data.pid
  } catch {}
  return null
}

async function cleanupTrackedPidFile() {
  try {
    await unlink(pidFile)
  } catch {}
}

function killPid(pid, signal) {
  try {
    process.kill(pid, signal)
  } catch {}
}

async function stopTrackedDevProcess() {
  const pid = await readTrackedPid()
  if (!pid) return
  try {
    process.kill(pid, 0)
  } catch {
    await cleanupTrackedPidFile()
    return
  }
  killPid(pid, "SIGTERM")
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 100))
    try {
      process.kill(pid, 0)
    } catch {
      await cleanupTrackedPidFile()
      return
    }
  }
  killPid(pid, "SIGKILL")
  await cleanupTrackedPidFile()
}

/** 開発ポートに残った next dev を止める（複数起動による .next 破損を防ぐ） */
function stopDevProcessesOnPreferredPorts() {
  try {
    execSync('pkill -f "next/dist/bin/next" 2>/dev/null || true', { stdio: "ignore" })
  } catch {}
  for (const port of preferredPorts) {
    try {
      const out = execSync(`lsof -ti tcp:${port}`, { encoding: "utf8" }).trim()
      if (!out) continue
      for (const pidText of out.split("\n")) {
        const pid = Number(pidText)
        if (Number.isFinite(pid) && pid !== process.pid) killPid(pid, "SIGKILL")
      }
    } catch {}
  }
}

/** build 後や turbo/webpack 混在・本番ビルド残存で .next が壊れているとき自動削除 */
async function shouldAutoCleanNext(turbo) {
  if (!(await pathExists(".next"))) return false
  if (await pathExists(".next/BUILD_ID")) return true

  const hasTransform = await pathExists(".next/transform.js")
  const hasWebpackCache = await pathExists(".next/cache/webpack")

  if (turbo && hasWebpackCache && !hasTransform) return true
  if (!turbo && hasTransform && !hasWebpackCache) return true

  return false
}

/** webpack-runtime が参照するチャンクが欠けていれば破損とみなす */
async function hasBrokenWebpackChunks() {
  const runtimePath = ".next/server/webpack-runtime.js"
  if (!(await pathExists(runtimePath))) return false

  try {
    const { readFile, access } = await import("node:fs/promises")
    const { dirname, join } = await import("node:path")
    const runtime = await readFile(runtimePath, "utf8")
    const dir = dirname(runtimePath)
    const ids = [...runtime.matchAll(/['"]\.\/(\d+\.js)['"]/g)].map((m) => m[1])
    for (const id of ids) {
      try {
        await access(join(dir, id))
      } catch {
        return true
      }
    }
  } catch {}

  return false
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const turbo = hasFlag("--turbo")
  const skipClean = hasFlag("--no-clean")

  await stopTrackedDevProcess()
  stopDevProcessesOnPreferredPorts()
  await sleep(500)

  if (!skipClean) {
    console.log("[dev] cleaning .next")
    await rm(".next", { recursive: true, force: true })
  } else if ((await shouldAutoCleanNext(turbo)) || (await hasBrokenWebpackChunks())) {
    console.log("[dev] cleaning stale .next cache")
    await rm(".next", { recursive: true, force: true })
  }

  const port = await pickPort()
  if (!port) {
    console.error(`[dev] 空きポートが見つかりません: ${preferredPorts.join(", ")}`)
    process.exit(1)
  }

  const nextBin = "node_modules/next/dist/bin/next"
  const args = [nextBin, "dev", "-p", String(port)]
  if (turbo) args.push("--turbo")

  console.log(`[dev] starting on http://localhost:${port}`)
  const child = spawn(process.execPath, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
    },
  })
  if (typeof child.pid === "number") {
    await writeFile(
      pidFile,
      JSON.stringify({ pid: child.pid, port, turbo, startedAt: new Date().toISOString() }, null, 2) + "\n",
      "utf8",
    )
  }

  child.on("exit", (code) => {
    cleanupTrackedPidFile().finally(() => {
      process.exit(code ?? 0)
    })
  })
}

main().catch((e) => {
  console.error("[dev] failed to start", e)
  process.exit(1)
})
