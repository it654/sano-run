import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// 1. Import AuthProvider vừa tạo
import AuthProvider from '@/components/AuthProvider' 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'H-Day Run',
  description: 'Hệ thống giải chạy nội bộ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {/* 2. Bọc toàn bộ ứng dụng bên trong AuthProvider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}