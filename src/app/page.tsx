// src/app/page.tsx
'use client';

import Navbar from '@/components/layout/Navbar';
import EventCard from '@/components/events/EventCard';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error('Lỗi khi tải danh sách giải chạy');
        }
      } catch (error) {
        console.error('Fetch events error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Hàm hỗ trợ format hiển thị dải ngày (Bắt đầu - Kết thúc)
  const formatDateRange = (start: string, end: string) => {
    const startDate = start ? new Date(start).toLocaleDateString('vi-VN') : '';
    const endDate = end ? new Date(end).toLocaleDateString('vi-VN') : '';

    if (startDate && endDate) return `Từ ${startDate} - ${endDate}`;
    if (startDate) return startDate;
    return 'Chưa xác định thời gian';
  };

  // Hàm hỗ trợ format hiển thị hạn đăng ký (Bao gồm cả giờ phút)
  const formatDeadline = (deadline: string) => {
    if (!deadline) return '';
    return new Date(deadline).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const openEvents = events.filter(e => e.status === 'OPEN');
  const upcomingEvents = events.filter(e => e.status === 'UPCOMING');
  const closedEvents = events.filter(e => e.status === 'CLOSED');
  const doingEvents = events.filter(e => e.status === 'DOING');

  const featuredEvent = openEvents.length > 0 ? openEvents[0] : events[0];

  return (
    <main className="flex-grow">
      {/* HERO BANNER FULL-WIDTH */}
      {featuredEvent && (
        <div className="w-full h-[300px] md:h-[450px] bg-gray-900 relative">
          <img
            src={featuredEvent.banner || featuredEvent.bannerUrl || "https://images.unsplash.com/photo-1552674605-15c37127ea96?auto=format&fit=crop&q=80&w=1920"}
            alt="Hero Banner"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

          <div className="absolute bottom-0 left-0 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
              <span className="bg-[#E32626] text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-3 inline-block">Sự kiện nổi bật</span>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-wide text-shadow-lg mb-2">
                {featuredEvent.title}
              </h1>

              <p className="text-gray-200 font-medium text-lg max-w-2xl mb-6">
                Lịch trình: {formatDateRange(featuredEvent.date, featuredEvent.endDate)} {featuredEvent.location !== " " && <span>tại {featuredEvent.location}</span>} 

                {/* [MỚI] Hiển thị hạn đăng ký trên Banner nếu giải đang mở */}
                {featuredEvent.status === 'OPEN' && featuredEvent.registrationDeadline && (
                  <span className="block mt-2 text-yellow-400 font-bold text-sm">
                    ⏰ Đóng đăng ký lúc: {formatDeadline(featuredEvent.registrationDeadline)}
                  </span>
                )}
              </p>

              <Link
                href={`/details/${featuredEvent.id}`}
                className="bg-[#E32626] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:-translate-y-1 inline-block uppercase tracking-wider text-sm"
              >
                Xem chi tiết & Đăng ký
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-16">

        {isLoading ? (
          <div className="text-center py-20 text-gray-500 font-medium">
            Đang tải danh sách giải chạy...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium">
            Hiện tại chưa có giải chạy nào được tổ chức.
          </div>
        ) : (
          <>
            {openEvents.length > 0 && (
              <section>
                <div className="mb-8 pb-2 flex items-center justify-between border-b border-gray-200">
                  <h2 className="text-2xl font-black uppercase text-[#1e3a8a] border-l-4 border-[#E32626] pl-3 tracking-tight">
                    Đang mở đăng ký
                  </h2>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">{openEvents.length} giải</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {openEvents.map(event => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      date={formatDateRange(event.date, event.endDate)}
                      deadline={event.registrationDeadline ? `Hạn đăng ký: ${new Date(event.registrationDeadline).toLocaleDateString('vi-VN')}` : undefined}
                      location={event.location}
                      distances={event.distances}
                      imageUrl={event.banner || event.bannerUrl}
                      status={event.status as any}
                    />
                  ))}
                </div>
              </section>
            )}

            {doingEvents.length > 0 && (
              <section>
                <div className="mb-8 pb-2 flex items-center justify-between border-b border-gray-200">
                  <h2 className="text-2xl font-black uppercase text-[#1e3a8a] border-l-4 border-[#E32626] pl-3 tracking-tight">
                    Đang diễn ra
                  </h2>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">{doingEvents.length} giải</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {doingEvents.map(event => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      date={formatDateRange(event.date, event.endDate)}
                      location={event.location}
                      distances={event.distances}
                      imageUrl={event.banner || event.bannerUrl}
                      status={event.status as any}
                    />
                  ))}
                </div>
              </section>
            )}

            {upcomingEvents.length > 0 && (
              <section>
                <div className="mb-8 pb-2 flex items-center justify-between border-b border-gray-200">
                  <h2 className="text-2xl font-black uppercase text-[#1e3a8a] border-l-4 border-[#E32626] pl-3 tracking-tight">
                    Sắp diễn ra
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 opacity-90">
                  {upcomingEvents.map(event => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      date={formatDateRange(event.date, event.endDate)}
                      location={event.location}
                      distances={event.distances}
                      imageUrl={event.banner || event.bannerUrl}
                      status={event.status as any}
                    />
                  ))}
                </div>
              </section>
            )}

            {closedEvents.length > 0 && (
              <section>
                <div className="mb-8 pb-2 flex items-center justify-between border-b border-gray-200">
                  <h2 className="text-2xl font-black uppercase text-gray-500 border-l-4 border-gray-400 pl-3 tracking-tight">
                    Đã kết thúc
                  </h2>
                  <a href="#" className="text-sm font-bold text-[#E32626] hover:underline">Xem tất cả lịch sử →</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 opacity-75 grayscale-[30%]">
                  {closedEvents.map(event => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      date={formatDateRange(event.date, event.endDate)}
                      location={event.location}
                      distances={event.distances}
                      imageUrl={event.banner || event.bannerUrl}
                      status={event.status as any}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}