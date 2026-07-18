import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerServiceWorker } from '@/lib/notify'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// 알림용 서비스워커 등록 (실패해도 앱은 정상 동작)
registerServiceWorker()
