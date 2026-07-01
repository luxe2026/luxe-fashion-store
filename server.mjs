import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, 'dist')

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json',
}

const server = http.createServer((req, res) => {
  let urlPath = req.url?.split('?')[0] || '/'
  let filePath = path.join(DIST, urlPath)

  // Security: prevent path traversal
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  const ext = path.extname(filePath).toLowerCase()

  // 禁用缓存的头 — 确保浏览器每次都获取最新版本
  const noCacheHeaders = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }

  // 静态资源(JS/CSS 带 hash 文件名)可以长期缓存
  const longCacheHeaders = {
    'Cache-Control': 'public, max-age=31536000, immutable',
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const mime = MIME[ext] || 'application/octet-stream'
      // HTML 文件禁用缓存,JS/CSS 带 hash 可长期缓存
      const headers = ext === '.html' ? noCacheHeaders : longCacheHeaders
      res.writeHead(200, { 'Content-Type': mime, ...headers })
      fs.createReadStream(filePath).pipe(res)
      return
    }

    if (!err && stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html')
      fs.stat(indexPath, (e2, s2) => {
        if (!e2 && s2.isFile()) {
          res.writeHead(200, { 'Content-Type': 'text/html', ...noCacheHeaders })
          fs.createReadStream(indexPath).pipe(res)
          return
        }
        serveSPA(res)
      })
      return
    }

    // SPA fallback
    serveSPA(res)
  })
})

function serveSPA(res) {
  const indexPath = path.join(DIST, 'index.html')
  fs.stat(indexPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
      return
    }
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    })
    fs.createReadStream(indexPath).pipe(res)
  })
}

const PORT = 4173
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✦ LUXE Fashion Store running at http://localhost:${PORT}/`)
})
