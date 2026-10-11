/**
 * After pack:tool, zip dist-tool/<id>/ into
 * dist-store/<id>-<version>-universal.tfpkg and write .artifact.json (sha256/size).
 * URL is left empty for the author to fill after Release upload.
 */
import { createHash } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { finished } from 'node:stream/promises'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = resolve(root, 'tool/manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as {
  id: string
  version: string
}
if (!manifest.id || !manifest.version) {
  throw new Error('tool/manifest.json 须含 id 与 version')
}

const toolDir = resolve(root, 'dist-tool', manifest.id)
try {
  await stat(toolDir)
} catch {
  throw new Error(`缺少 ${toolDir}，请先运行 pnpm pack:tool`)
}

const outDir = resolve(root, 'dist-store')
await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const baseName = `${manifest.id}-${manifest.version}-universal`
const tfpkgPath = resolve(outDir, `${baseName}.tfpkg`)
const artifactPath = resolve(outDir, `${baseName}.artifact.json`)

await zipDirectoryStored(toolDir, tfpkgPath)

const bytes = await readFile(tfpkgPath)
const sha256 = createHash('sha256').update(bytes).digest('hex')
const artifact = {
  id: manifest.id,
  version: manifest.version,
  target: 'universal',
  sha256,
  size: bytes.length,
  url: '',
  fileName: `${baseName}.tfpkg`,
}
await writeFile(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`)

console.log(`store package ${tfpkgPath}`)
console.log(`artifact ${artifactPath}`)
console.log(`sha256 ${sha256}`)

/** Minimal ZIP (store only) so we do not need an extra dependency. */
async function zipDirectoryStored(srcDir: string, outFile: string): Promise<void> {
  const files: Array<{ abs: string; name: string; size: number }> = []
  async function walk(dir: string) {
    for (const ent of await readdir(dir, { withFileTypes: true })) {
      const abs = join(dir, ent.name)
      if (ent.isDirectory()) {
        await walk(abs)
      } else if (ent.isFile()) {
        const name = relative(srcDir, abs).split('\\').join('/')
        const st = await stat(abs)
        files.push({ abs, name, size: st.size })
      }
    }
  }
  await walk(srcDir)
  files.sort((a, b) => a.name.localeCompare(b.name))

  const out = createWriteStream(outFile)
  const central: Buffer[] = []
  let offset = 0

  for (const file of files) {
    const data = await readFile(file.abs)
    const nameBuf = Buffer.from(file.name, 'utf8')
    const crc = crc32(data)
    const local = Buffer.alloc(30 + nameBuf.length)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0, 6)
    local.writeUInt16LE(0, 8) // store
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(0, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBuf.length, 26)
    local.writeUInt16LE(0, 28)
    nameBuf.copy(local, 30)
    out.write(local)
    out.write(data)

    const cen = Buffer.alloc(46 + nameBuf.length)
    cen.writeUInt32LE(0x02014b50, 0)
    cen.writeUInt16LE(20, 4)
    cen.writeUInt16LE(20, 6)
    cen.writeUInt16LE(0, 8)
    cen.writeUInt16LE(0, 10)
    cen.writeUInt16LE(0, 12)
    cen.writeUInt16LE(0, 14)
    cen.writeUInt32LE(crc, 16)
    cen.writeUInt32LE(data.length, 20)
    cen.writeUInt32LE(data.length, 24)
    cen.writeUInt16LE(nameBuf.length, 28)
    cen.writeUInt16LE(0, 30)
    cen.writeUInt16LE(0, 32)
    cen.writeUInt16LE(0, 34)
    cen.writeUInt16LE(0, 36)
    cen.writeUInt32LE(0, 38)
    cen.writeUInt32LE(offset, 42)
    nameBuf.copy(cen, 46)
    central.push(cen)
    offset += local.length + data.length
  }

  const centralStart = offset
  for (const c of central) {
    out.write(c)
    offset += c.length
  }
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(offset - centralStart, 12)
  end.writeUInt32LE(centralStart, 16)
  end.writeUInt16LE(0, 20)
  out.write(end)
  out.end()
  await finished(out)
}

function crc32(buf: Buffer): number {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]!
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1
    }
  }
  return (c ^ 0xffffffff) >>> 0
}
