import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 빌드 시각(KST) -> 앱 버전 문자열. 배포 반영 여부 확인용.
function buildVersion() {
  const kst = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' })
  // 'YYYY-MM-DD HH:mm:ss' -> 'YYYY.MM.DD-HHmm'
  const [date, time] = kst.split(' ')
  return `${date.replaceAll('-', '.')}-${time.slice(0, 5).replace(':', '')}`
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion()),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
