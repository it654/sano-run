'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  
  // State để quản lý việc mở/đóng dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hiệu ứng: Tự động đóng Dropdown khi click ra ngoài vùng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand (Nên bọc trong Link để bấm về Trang chủ) */}
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 2c-1.78 0-2.5 1.5-2.5 2.5 0 1.5 1.5 2 2.5 2s2.5-.5 2.5-2-1-2.5-2.5-2.5zm-5 4c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5c1.3 0 2 .8 2 2.5V14H8v6h2v-4h2.5l2 4h2.2l-2.4-4.5c1.4-.6 2.2-1.9 2.2-3.5 0-2.2-1.8-4-4-4h-2V7.5c0-.8-.7-1.5-1.5-1.5z" /></svg>
            <span className="font-black text-2xl text-blue-900 tracking-tight">SANORUN</span>
          </Link>

          {/* Right Menu */}
          <div className="flex items-center gap-4">
            
            {/* KHU VỰC XỬ LÝ ĐĂNG NHẬP */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse ml-2"></div>
            ) : session ? (
              
              // TRẠNG THÁI ĐÃ ĐĂNG NHẬP: Hiển thị Dropdown
              <div className="relative ml-2" ref={dropdownRef}>
                
                {/* Nút bấm để mở Dropdown */}
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                >
                  <img
                    src={session.user?.image || 'https://via.placeholder.com/150'}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-sm font-bold text-gray-700 hidden sm:block">
                    {session.user?.name}
                  </span>
                  {/* Icon mũi tên thả xuống */}
                  <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Nội dung Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    <Link 
                      href="/profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#E32626] font-semibold transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Trang cá nhân
                    </Link>

                    {/* Dấu gạch ngang phân cách */}
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-semibold transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              
              // TRẠNG THÁI CHƯA ĐĂNG NHẬP
              <button
                onClick={() => signIn("google")}
                className="ml-2 text-sm bg-[#E32626] hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.28,22 12.14,22C17.05,22 22,18.81 22,11.87C22,11.5 21.9,11.1 21.9,11.1L21.35,11.1Z" />
                </svg>
                Google Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}