// Run-time Node version guard. Plain ESM, Node built-ins only, Node 18 safe
// (it must run on the very Node versions it rejects).
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

export function readEnginesRange() {
  const pkg = JSON.parse(readFileSync(resolve(here, '..', 'package.json'), 'utf8'))
  return pkg.engines.node
}

function parseVersion(text) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(text)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

function atLeast(v, min) {
  for (let i = 0; i < 3; i++) {
    if (v[i] !== min[i]) return v[i] > min[i]
  }
  return true
}

// Supports only `||`-separated `^X.Y.Z` and `>=X.Y.Z`; anything else throws.
function satisfiesAlternative(v, alt) {
  const m = /^(\^|>=)(\d+)\.(\d+)\.(\d+)$/.exec(alt.trim())
  if (!m) throw new Error(`Unsupported engines.node range shape: "${alt.trim()}"`)
  const min = [Number(m[2]), Number(m[3]), Number(m[4])]
  if (m[1] === '^' && v[0] !== min[0]) return false
  return atLeast(v, min)
}

export function isSupportedNode(version, range = readEnginesRange()) {
  const alternatives = range.split('||')
  // Validate the range first so a bad shape throws even for a bad version.
  const results = alternatives.map((alt) => {
    const m = /^(\^|>=)(\d+)\.(\d+)\.(\d+)$/.exec(alt.trim())
    if (!m) throw new Error(`Unsupported engines.node range shape: "${alt.trim()}"`)
    return alt
  })
  const v = parseVersion(version)
  if (!v) return false
  return results.some((alt) => satisfiesAlternative(v, alt))
}

function isMain() {
  if (!process.argv[1]) return false
  return import.meta.url === pathToFileURL(resolve(process.argv[1])).href
}

if (isMain()) {
  const range = readEnginesRange()
  const current = process.versions.node
  if (!isSupportedNode(current, range)) {
    process.stderr.write(
      `This project needs Node ${range} (recommended: 24, see .nvmrc); you are running ${current}.\n` +
        'Fix: run `nvm use` in web/ (then `npm ci` if node_modules was installed with another Node).\n',
    )
    process.exit(1)
  }
}
