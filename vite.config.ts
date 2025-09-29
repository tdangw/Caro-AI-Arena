
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Caro-AI-Arena/', // RẤT QUAN TRỌNG: Thay đổi thành tên repo của bạn
})
