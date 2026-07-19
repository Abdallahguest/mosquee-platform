import net from 'node:net'

const host = process.env.PGHOST || '127.0.0.1'
const port = Number(process.env.PGPORT || 5432)
const timeoutMs = 60_000
const start = Date.now()

function tryConnect() {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(2000)

    socket
      .once('connect', () => {
        socket.destroy()
        resolve(true)
      })
      .once('timeout', () => {
        socket.destroy()
        resolve(false)
      })
      .once('error', () => {
        socket.destroy()
        resolve(false)
      })
      .connect(port, host)
  })
}

while (Date.now() - start < timeoutMs) {
  // eslint-disable-next-line no-await-in-loop
  const ok = await tryConnect()
  if (ok) {
    console.log(`Postgres is up at ${host}:${port}`)
    process.exit(0)
  }
  // eslint-disable-next-line no-await-in-loop
  await new Promise((r) => setTimeout(r, 1000))
}

console.error(`Timeout waiting for Postgres at ${host}:${port}`)
process.exit(1)
