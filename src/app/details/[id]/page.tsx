'use client';

import RegistrationModal from '@/components/events/RegistrationModal';
import Navbar from '@/components/layout/Navbar';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EventDetailTabs from '@/components/EventDetailTabs';

interface CountdownBoxProps {
    value: string;
    label: string;
}
function CountdownBox({ value, label }: CountdownBoxProps) {
    return (
        <div className="bg-[#2B2D31] text-white rounded-2xl w-[70px] h-[85px] md:w-[80px] md:h-[95px] flex flex-col justify-center items-center shadow-md">
            <span className="text-3xl md:text-4xl font-black tracking-tighter">{value}</span>
            <span className="text-[10px] md:text-xs font-medium uppercase mt-1 text-gray-300">{label}</span>
        </div>
    );
}

export default function EventDetailPage() {
    const params = useParams();
    const eventId = params?.id;
    const [eventData, setEventData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!eventId) return;

        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/events/${eventId}`);
                if (res.ok) {
                    const data = await res.json();
                    setEventData(data);
                } else {
                    console.error('Không tìm thấy giải chạy');
                }
            } catch (error) {
                console.error('Lỗi khi tải giải chạy:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);

    useEffect(() => {
        if (!eventData || !eventData.registrationDeadline) return;

        const targetDate = new Date(eventData.registrationDeadline).getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0'),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'),
                seconds: Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0')
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [eventData]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E32626]"></div>
            </div>
        );
    }

    if (!eventData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
                <h1 className="text-2xl font-bold text-gray-500">Giải chạy không tồn tại hoặc đã bị xóa.</h1>
            </div>
        );
    }

    const runDateFormatted = new Date(eventData.date).toLocaleDateString('vi-VN');
    const deadlineFormatted = new Date(eventData.registrationDeadline).toLocaleDateString('vi-VN');
    const distancesArray = eventData.distances.split(',').map((d: string) => d.trim());

    // Phải gọi lại biến eventData.status ở vế sau
const isEventClosed = eventData.status === 'CLOSED' || eventData.status === 'DOING';

    return (
     <>

            {/* HERO BANNER FULL-WIDTH */}
            <div className="w-full h-[300px] md:h-[450px] bg-gray-900 relative">
                <img
                    src={eventData.banner || "https://images.unsplash.com/photo-1552674605-15c37127ea96?auto=format&fit=crop&q=80&w=1920"}
                    className="w-full h-full object-cover opacity-80"
                    alt={eventData.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                        {eventData.status === 'OPEN' && <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-3 inline-block shadow-sm">Đang mở đăng ký</span>}
                        {eventData.status === 'UPCOMING' && <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-3 inline-block shadow-sm">Sắp diễn ra</span>}
                        {eventData.status === 'CLOSED' && <span className="bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-3 inline-block shadow-sm">Đã kết thúc / Đang chạy</span>}

                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-wide text-shadow-md">
                            {eventData.title}
                        </h1>
                        <p className="text-gray-200 mt-2 font-medium text-lg">{eventData.location} | {runDateFormatted}</p>
                    </div>
                </div>
            </div>

            {/* STICKY TAB MENU */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <ul className="flex space-x-6 overflow-x-auto no-scrollbar">
                        <li><a href="#gioi-thieu" className="block py-4 text-sm font-bold text-red-600 border-b-2 border-red-600 whitespace-nowrap uppercase">Chi tiết giải chạy</a></li>
                        {/* <li><a href="#bang-xep-hang" className="block py-4 text-sm font-bold text-gray-600 hover:text-red-600 border-b-2 border-transparent hover:border-red-600 whitespace-nowrap uppercase transition-all">Bảng xếp hạng</a></li> */}
                    </ul>
                    
                    {/* Ẩn hoàn toàn nút Đăng Ký trên Navbar nếu giải đã chạy */}
                    {!isEventClosed && (
                        <div className="hidden md:block py-2">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="font-bold py-2 px-6 rounded shadow-md uppercase transition-colors bg-red-600 hover:bg-red-700 text-white"
                            >
                                Đăng ký ngay
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT LAYOUT */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">

                {/* === KHU VỰC THÔNG TIN SỰ KIỆN & ĐẾM NGƯỢC (Chỉ hiện khi chưa đóng) === */}
                {!isEventClosed && (
                    <div className="w-full mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-[#F4F5F7] rounded-[2rem] p-8 md:p-12 text-center shadow-sm border border-gray-100">
                            <div className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
                                Thời gian đăng ký còn lại
                            </div>

                            <div className="flex justify-center gap-3 md:gap-4 mb-4">
                                <CountdownBox value={timeLeft.days} label="Ngày" />
                                <CountdownBox value={timeLeft.hours} label="Giờ" />
                                <CountdownBox value={timeLeft.minutes} label="Phút" />
                                <CountdownBox value={timeLeft.seconds} label="Giây" />
                            </div>

                            <div className="text-gray-600 text-sm font-medium mb-8">
                                Đóng cổng đăng ký lúc: <span className="text-[#E32626]">23:59 ngày {deadlineFormatted}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mt-10 max-w-5xl mx-auto">
                            <div className="bg-[#FDE29F] rounded-2xl p-6 pt-10 pb-8 relative shadow-sm border border-[#f5d98e]">
                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-4/5">
                                    <div className="bg-white rounded-full py-2.5 px-6 text-center shadow-sm text-gray-900 font-bold text-lg">
                                        Cự ly tham gia
                                    </div>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                    {distancesArray.map((dist: string, idx: number) => (
                                        <div key={idx} className="bg-[#2B2D31] text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {dist}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#FDE29F] rounded-2xl p-6 pt-10 pb-8 relative shadow-sm border border-[#f5d98e]">
                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-4/5">
                                    <div className="bg-white rounded-full py-2.5 px-6 text-center shadow-sm text-gray-900 font-bold text-lg">
                                        Hoạt động hợp lệ
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-3 mt-2">
                                    <div className="flex flex-wrap justify-center gap-3 w-full">
                                        <div className="bg-[#2B2D31] text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2">
                                            <svg className="w-5 h-5 bg-white text-black rounded-full p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            Chạy bộ
                                        </div>
                                        <div className="bg-[#2B2D31] text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2">
                                            <svg className="w-5 h-5 bg-white text-black rounded-full p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                            Đi bộ
                                        </div>
                                    </div>
                                    <div className="bg-[#2B2D31] text-white px-5 py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center justify-center gap-2 w-full max-w-[320px] text-center leading-tight mt-2">
                                        <svg className="w-6 h-6 bg-white text-black rounded-full p-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                                        Hoàn thành cuộc đua với <br />một hoặc nhiều hoạt động
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2 CỘT NỘI DUNG CHI TIẾT & SIDEBAR */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* CỘT TRÁI: Truyền showResults vào EventDetailTabs. */}
                    {/* Thuộc tính lg:w-2/3 chỉ áp dụng khi có Sidebar bên phải. Nếu sự kiện CLOSED, nó bung ra Full-width */}
                    <article className={`w-full ${!isEventClosed ? 'lg:w-2/3' : ''} transition-all duration-500`}>
                        <div id="gioi-thieu" className="scroll-mt-32">
                            <EventDetailTabs 
                                eventId={eventData.id} 
                                eventData={eventData} 
                                showResults={isEventClosed} 
                            />
                        </div>
                    </article>

                    {/* CỘT PHẢI: Sidebar Tóm tắt & Nút Đăng ký (CHỈ HIỆN KHI CHƯA ĐÓNG CỔNG) */}
                    {!isEventClosed && (
                        <aside className="w-full lg:w-1/3 space-y-6 sticky top-32 self-start animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="bg-white rounded-2xl shadow-md border-t-4 border-red-600 overflow-hidden border border-gray-100">
                                <div className="p-6 pb-4">
                                    <div className="flex justify-between items-center mb-6">
                                        {eventData.status === 'OPEN' && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Đang mở đăng ký</span>}
                                        {eventData.status === 'UPCOMING' && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Sắp diễn ra</span>}
                                        <span className="text-xs font-bold text-gray-500">Slots không giới hạn</span>
                                    </div>

                                    <h2 className="text-xl font-bold text-blue-900 uppercase mb-5 border-b-2 border-gray-100 pb-2 italic tracking-wide">Thông tin sự kiện</h2>

                                    <div className="space-y-4 mb-6 text-sm">
                                        <div className="flex items-start">
                                            <span className="w-5 h-5 text-gray-400 mr-3 mt-0.5 text-base">📅</span>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Hạn chót đăng ký</p>
                                                <p className="font-medium text-gray-900 text-sm">23:59 - {deadlineFormatted}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-5 h-5 text-gray-400 mr-3 mt-0.5 text-base">🏁</span>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Ngày diễn ra</p>
                                                <p className="font-medium text-gray-900 text-sm">Từ {runDateFormatted}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-5 h-5 text-gray-400 mr-3 mt-0.5 text-base">📍</span>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Địa điểm</p>
                                                <p className="font-medium text-gray-900 text-xs">{eventData.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-5 h-5 text-gray-400 mr-3 mt-0.5 text-base">🏃</span>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cự ly</p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {distancesArray.map((d: string, i: number) => (
                                                        <span key={i} className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-gray-200 tracking-wider">{d}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 pt-2 bg-gray-50 border-t border-gray-100">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full font-black text-lg py-3.5 px-4 rounded-xl shadow-lg uppercase transition-all text-center block tracking-widest italic group bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        <>Đăng ký ngay <span className="inline-block transition-transform group-hover:translate-x-1">→</span></>
                                    </button>
                                    <p className="text-center text-[10px] text-gray-400 mt-3 italic">* Vui lòng kiểm tra kỹ cự ly trước khi xác nhận.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-[11px] font-bold text-gray-900 uppercase mb-4 border-b border-gray-100 pb-2 tracking-widest">Đơn vị tổ chức</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold shrink-0 text-xl shadow-md">
                                        HR
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Phòng Hành chính Nhân sự</p>
                                        <p className="text-[11px] text-gray-500 mt-1">SĐT Hỗ trợ: <span className="text-red-600 font-bold">0987.654.321</span></p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </main>


            <RegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                eventTitle={eventData?.title || ''}
                eventId={eventData?.id || ''}
                eventDistances={eventData?.distances || ''}
            />
      </>  
    );
}