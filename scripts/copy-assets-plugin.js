import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default function copyAssetsPlugin() {
  return {
    name: 'copy-assets',
    writeBundle() {
      // This runs after the bundle is written
      copyBootstrapAssets()
      copyPublicFiles()
    }
  }
}

// Copy Bootstrap assets (JS and fonts)
function copyBootstrapAssets() {
  const sourceDir = path.join(__dirname, '../vendor/bootstrap/dist')
  const targetDir = path.join(__dirname, '../dist')

  // Ensure target directories exist
  fs.mkdirSync(path.join(targetDir, 'js'), { recursive: true })
  fs.mkdirSync(path.join(targetDir, 'fonts'), { recursive: true })

  // Copy JS files
  const jsFiles = ['bootstrap.js', 'bootstrap.min.js']
  jsFiles.forEach(file => {
    const source = path.join(sourceDir, 'js', file)
    const target = path.join(targetDir, 'js', file)
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, target)
      console.log(`✓ Copied: ${file}`)
    }
  })

  // Copy font files
  const fontsDir = path.join(sourceDir, 'fonts')
  if (fs.existsSync(fontsDir)) {
    const fontFiles = fs.readdirSync(fontsDir)
    fontFiles.forEach(file => {
      const source = path.join(fontsDir, file)
      const target = path.join(targetDir, 'fonts', file)
      fs.copyFileSync(source, target)
      console.log(`✓ Copied: fonts/${file}`)
    })
  }
}

// Copy public files (HTML, CNAME, etc.)
function copyPublicFiles() {
  const sourceDir = path.join(__dirname, '../public')
  const targetDir = path.join(__dirname, '../dist')

  if (!fs.existsSync(sourceDir)) {
    return
  }

  const files = fs.readdirSync(sourceDir)
  files.forEach(file => {
    const source = path.join(sourceDir, file)
    const target = path.join(targetDir, file)

    if (fs.statSync(source).isFile()) {
      fs.copyFileSync(source, target)
      console.log(`✓ Copied: ${file}`)
    }
  })
}
