import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'
import legacy from '@vitejs/plugin-legacy'
import autoprefixer from 'autoprefixer'
import bannerPlugin from './scripts/banner-plugin.js'
import copyAssetsPlugin from './scripts/copy-assets-plugin.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    legacy({
      targets: ['ie >= 8'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    bannerPlugin(),
    copyAssetsPlugin()
  ],

  root: '.',

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        bootstrap: resolve(__dirname, 'scss/bootstrap.scss'),
        example: resolve(__dirname, 'src/scss/example.scss'),
      },

      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            if (assetInfo.name.includes('bootstrap')) {
              return 'css/bootstrap.css'
            }
            return 'assets/css/[name].css'
          }
          if (assetInfo.name?.match(/\.(woff2?|eot|ttf|otf)$/)) {
            return 'fonts/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },

    cssCodeSplit: false,

    // CSS minification settings
    cssMinify: 'lightningcss'
  },

  css: {
    preprocessorOptions: {
      scss: {
        includePaths: [
          'vendor/bootstrap-sass/assets/stylesheets/',
          'scss/'
        ],
        charset: false
      }
    },

    postcss: {
      plugins: [
        autoprefixer({
          overrideBrowserslist: [
            'Android 2.3',
            'Android >= 4',
            'Chrome >= 20',
            'Firefox >= 24',
            'Explorer >= 8',
            'iOS >= 6',
            'Opera >= 12',
            'Safari >= 6'
          ]
        })
      ]
    }
  },

  // Disable default public directory handling, use custom plugin instead
  publicDir: false,

  server: {
    port: 8000,
    host: true,
    open: false
  },

  preview: {
    port: 8000,
    host: true
  }
})
