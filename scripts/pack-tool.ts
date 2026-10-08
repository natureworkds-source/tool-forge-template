/**
 * Assemble dist-tool/<id>/{manifest.json,ui/**} for installation under
 * {appData}/tools/<id>/.
 */
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = resolve(root, 'tool/manifest.json')
const distUi = resolve(root, 'dist')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as { id: string; entry: string }
if (!manifest.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.id)) {
  throw new Error(`invalid manifest.id: ${manifest.id}`)
}
const outDir = resolve(root, 'dist-tool', manifest.id)
await rm(outDir, { recursive: true, force: true })
await mkdir(resolve(outDir, 'ui'), { recursive: true })
await cp(distUi, resolve(outDir, 'ui'), { recursive: true })
const packedManifest = {
  ...manifest,
  entry: manifest.entry.startsWith('ui/') ? manifest.entry : `ui/${manifest.entry.replace(/^\.\//, '')}`,
}
// Vite emits index.html at dist root → ui/index.html after copy
if (!packedManifest.entry.startsWith('ui/')) {
  packedManifest.entry = 'ui/index.html'
} else {
  // entry in source manifest is ui/index.html; after copy files are under ui/
  packedManifest.entry = 'ui/index.html'
}
await writeFile(resolve(outDir, 'manifest.json'), `${JSON.stringify(packedManifest, null, 2)}\n`)
console.log(`packed ${outDir}`)
