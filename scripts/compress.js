import archiver from 'archiver'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))
const name = pkg.name.toLowerCase()

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const output = fs.createWriteStream(path.join(dataDir, `bootstrap-${name}-${pkg.version}-dist.zip`))
const archive = archiver('zip', {
  zlib: { level: 9 }
})

output.on('close', () => {
  console.log(`Created: bootstrap-${name}-${pkg.version}-dist.zip (${archive.pointer()} bytes)`)
})

archive.on('error', (err) => {
  throw err
})

archive.pipe(output)

// Add files to archive
// CSS files
archive.glob('bootstrap*.css', {
  cwd: 'dist/css',
  prefix: `${name}/css/`
})

// Font files
archive.glob('**/*', {
  cwd: 'dist/fonts',
  prefix: `${name}/fonts/`
})

// JavaScript files
archive.glob('bootstrap.*js', {
  cwd: 'dist/js',
  prefix: `${name}/js/`
})

// Sample HTML (if exists)
archive.glob('bootstrap.html', {
  cwd: 'dist',
  prefix: `${name}/`
})

// README
archive.file('README.md', { name: `${name}/README.md` })

archive.finalize()
