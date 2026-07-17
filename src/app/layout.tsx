import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// 1. Import AuthProvider vừa tạo
import AuthProvider from '@/components/AuthProvider'
import Navbar from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SanoRun',
  description: 'Hệ thống giải chạy nội bộ',
  icons: 'icon.png'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {/* 2. Bọc toàn bộ ứng dụng bên trong AuthProvider */}
          {children}
          <footer className="border-t border-gray-200 bg-white mt-auto py-6">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 font-medium">
              © 2026 SanoRun Nội bộ.
            </div>
          </footer>
        </AuthProvider>
      </body>

    </html>
  )
}