import fs from 'fs'
import path from 'path'

export default function bannerPlugin() {
  return {
    name: 'banner-plugin',
    generateBundle(options, bundle) {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

      // Bootstrap package info (from vendor directory if available)
      let twbsInfo = { version: '3.3.7', homepage: 'https://getbootstrap.com', author: 'Twitter, Inc.', license: 'MIT' }
      try {
        const twbsPkg = JSON.parse(fs.readFileSync('vendor/bootstrap/package.json', 'utf8'))
        twbsInfo = {
          version: twbsPkg.version,
          homepage: twbsPkg.homepage,
          author: twbsPkg.author,
          license: twbsPkg.license
        }
      } catch (e) {
        // Fallback to default values
      }

      const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * Website ${pkg.website}
 * Copyright 2015 ${pkg.author}
 * The ${pkg.license} License
${pkg.name !== "Honoka" ? ' * Based on Honoka (http://honokak.osaka/) by windyakin\n' : ''}
 */
/*!
 * Bootstrap v${twbsInfo.version} (${twbsInfo.homepage})
 * Copyright 2011-${new Date().getFullYear()} ${twbsInfo.author}
 * Licensed under the ${twbsInfo.license} license
 */
`

      Object.keys(bundle).forEach(fileName => {
        if (fileName.endsWith('.css')) {
          const chunk = bundle[fileName]
          if (chunk.type === 'asset' && typeof chunk.source === 'string') {
            // Replace @charset if present, otherwise prepend
            if (chunk.source.startsWith('@charset "UTF-8";')) {
              chunk.source = chunk.source.replace('@charset "UTF-8";', `@charset "UTF-8";\n${banner}`)
            } else {
              chunk.source = banner + chunk.source
            }

            // Fix font paths
            chunk.source = chunk.source.replace(/\.\.\/fonts\/bootstrap\//g, '../fonts/')
          }
        }
      })
    }
  }
}
