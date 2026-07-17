import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
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
      {/* 1. Bổ sung min-h-screen và flex flex-col vào body để tạo khung toàn màn hình */}
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <AuthProvider>
          
          <Navbar />
          
          {/* 2. Bọc children bằng thẻ main và thêm flex-grow để tự động đẩy Footer xuống đáy */}
          <main className="flex-grow flex flex-col w-full">
            {children}
          </main>

          {/* 3. Footer giữ nguyên mt-auto */}
          <footer className="border-t border-gray-200 bg-white mt-auto py-6 w-full">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 font-medium">
              © 2026 SanoRun Nội bộ.
            </div>
          </footer>

        </AuthProvider>
      </body>
    </html>
  )
}