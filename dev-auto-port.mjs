import { readFile, rm, unlink, writeFile } from "node:fs/promises"
import net from "node:net"
import { spawn } from "node:child_process"

const preferredPorts = [3000, 3001, 3002, 3003, 3340]
const pidFile = ".dev-server.pid.json"

function hasFlag(name) {
  return process.argv.includes(name)
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

async function stopTrackedDevProcess() {
  const pid = await readTrackedPid()
  if (!pid) return
  try {
    // まず存在確認
    process.kill(pid, 0)
  } catch {
    await cleanupTrackedPidFile()
    return
  }
  try {
    process.kill(pid, "SIGTERM")
  } catch {}
  // 最大3秒待機し、残っていたら強制終了
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 100))
    try {
      process.kill(pid, 0)
    } catch {
      await cleanupTrackedPidFile()
      return
    }
  }
  try {
    process.kill(pid, "SIGKILL")
  } catch {}
  await cleanupTrackedPidFile()
}

async function main() {
  const clean = hasFlag("--clean")
  const turbo = hasFlag("--turbo")
  await stopTrackedDevProcess()
  if (clean) {
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
      WATCHPACK_POLLING: "true",
      CHOKIDAR_USEPOLLING: "true",
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
