'use client';

import Navbar from '@/components/layout/Navbar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload'); // State quản lý Tab

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedReg, setSelectedReg] = useState('');
  const [distance, setDistance] = useState('');
  const [runDate, setRunDate] = useState(todayStr);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const fetchMyRegistrations = async () => {
    try {
      const res = await fetch('/api/user/registrations');
      if (res.ok) {
        const data = await res.json();
        setMyRegistrations(data);
      }
    } catch (error) {
      console.error("Lỗi fetch giải:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMyRegistrations();
    }
  }, [status]);

  if (status === 'loading' || isLoadingData) return <div className="p-10 text-center text-gray-500 font-bold">Đang tải thông tin...</div>;
  if (!session) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok && data.url) {
        setProofUrl(data.url);
      } else {
        alert("Lỗi upload: " + data.error);
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi upload ảnh!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg || !distance || !proofUrl || !runDate) {
      alert("Vui lòng điền đủ thông tin và tải ảnh bằng chứng!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: selectedReg,
          distance: distance,
          proofImage: proofUrl,
          runDate: runDate 
        })
      });

      if (res.ok) {
        alert("Gửi kết quả thành công! Hệ thống đã ghi nhận.");
        setDistance('');
        setProofUrl(null);
        fetchMyRegistrations(); 
        setActiveTab('history'); // Tự động chuyển qua tab lịch sử sau khi nộp thành công
      } else {
        const err = await res.json();
        alert("Lỗi: " + err.error);
      }
    } catch (error) {
      alert("Lỗi hệ thống.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gom tất cả lịch sử chạy (activities) từ các giải lại thành 1 mảng để vẽ Timeline
  const allActivities = myRegistrations.flatMap(reg => 
    (reg.activities || []).map((act: any) => ({
      ...act,
      eventTitle: reg.event.title
    }))
  ).sort((a, b) => new Date(b.runDate).getTime() - new Date(a.runDate).getTime());
  // Hàm xử lý xóa kết quả
  const handleDeleteActivity = async (activityId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kết quả chạy này không? Hành động này không thể hoàn tác.')) {
      try {
        const res = await fetch(`/api/activities/${activityId}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          alert("Xóa kết quả thành công!");
          fetchMyRegistrations(); // Refresh lại dữ liệu ngay lập tức
        } else {
          const err = await res.json();
          alert("Lỗi: " + err.error);
        }
      } catch (error) {
        alert("Lỗi hệ thống khi xóa kết quả.");
      }
    }
  };
  return (
    
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tight mb-6">Trang cá nhân</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CỘT TRÁI: THÔNG TIN USER */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 self-start sticky top-24">
            <div className="flex flex-col items-center">
              <img src={session.user?.image || ''} referrerPolicy="no-referrer" alt="Avatar" className="w-24 h-24 rounded-full shadow-md mb-4 border-2 border-gray-100" />
              <h2 className="text-xl font-bold text-gray-900">{session.user?.name}</h2>
              <p className="text-sm text-gray-500 mb-6">{session.user?.email}</p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Giải đang tham gia</h3>
              {myRegistrations.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Bạn chưa tham gia giải chạy nào.</p>
              ) : (
                <ul className="space-y-3">
                  {myRegistrations.map(reg => (
                    <li key={reg.id} className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="font-bold text-[#1e3a8a] text-sm">{reg.event.title}</p>
                      <p className="text-xs text-gray-600 mt-1">Đã chạy: <span className="font-bold text-green-600">{reg.totalDistance} km</span></p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: TABS & NỘI DUNG */}
          <div className="md:col-span-2">
            
            {/* THAH ĐIỀU HƯỚNG TABS */}
            <div className="flex space-x-2 mb-6">
              <button 
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-3 font-bold rounded-xl text-sm uppercase transition-all shadow-sm ${activeTab === 'upload' ? 'bg-[#1e3a8a] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
              >
                Nộp kết quả
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 font-bold rounded-xl text-sm uppercase transition-all shadow-sm ${activeTab === 'history' ? 'bg-[#1e3a8a] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
              >
                Lịch sử hoạt động
              </button>
            </div>

            {/* NỘI DUNG TAB: NỘP KẾT QUẢ */}
            {activeTab === 'upload' && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
                <h2 className="text-lg font-black text-[#E32626] uppercase mb-4 border-b border-gray-100 pb-3">Cập nhật kết quả chạy (Strava/Garmin)</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Chọn giải chạy <span className="text-red-500">*</span></label>
                    <select 
                      required
                      value={selectedReg}
                      onChange={(e) => setSelectedReg(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E32626] text-sm font-medium"
                    >
                      <option value="" disabled>-- Chọn giải đang tham gia --</option>
                      {myRegistrations.map(reg => (
                        <option key={reg.id} value={reg.id}>{reg.event.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Ngày chạy <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        required
                        value={runDate}
                        onChange={(e) => setRunDate(e.target.value)}
                        max={todayStr} 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E32626] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Cự ly hoàn thành (Km) <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0.1"
                        required
                        placeholder="VD: 5.25"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E32626] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh chụp màn hình kết quả <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-sm transition-colors border border-gray-300">
                        {isUploading ? 'Đang tải...' : 'Tải ảnh lên'}
                        <input type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                      </label>
                      {proofUrl && <span className="text-sm text-green-600 font-bold">✓ Tải ảnh thành công</span>}
                    </div>
                    
                    {proofUrl && (
                      <div className="mt-3 w-32 h-32 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <img src={proofUrl} alt="Bằng chứng" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={isSubmitting || isUploading || myRegistrations.length === 0}
                      className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm text-white shadow-md transition-colors 
                        ${isSubmitting || isUploading || myRegistrations.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E32626] hover:bg-red-700'}`}
                    >
                      {isSubmitting ? 'Đang gửi...' : 'Gửi kết quả'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* NỘI DUNG TAB: LỊCH SỬ DẠNG TIMELINE */}
            {activeTab === 'history' && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
                <h2 className="text-lg font-black text-[#1e3a8a] uppercase mb-8 border-b border-gray-100 pb-3">Lịch sử chạy của bạn</h2>
                
                {allActivities.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 italic">
                    Chưa có hoạt động nào được ghi nhận.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-gray-200 ml-4 md:ml-24 mt-6">
                    {allActivities.map((act, index) => {
                      const dateObj = new Date(act.runDate);
                      const displayDate = `${dateObj.getDate()}-${dateObj.getMonth() + 1}`; // Trích xuất dạng 15-7

                      return (
                        <div key={index} className="mb-10 pl-8 relative group">
                          
                          {/* Chấm tròn (Dot) */}
                          <div className="absolute w-4 h-4 bg-[#E32626] rounded-full -left-[9px] top-2 border-[3px] border-white shadow-sm group-hover:scale-125 transition-transform"></div>
                          
                          {/* Ngày tháng (Nằm bên trái ở màn hình lớn, nằm trên ở mobile) */}
                          <div className="md:absolute md:-left-24 md:top-1.5 md:w-16 md:text-right text-sm font-bold text-gray-500 mb-2 md:mb-0">
                            {displayDate}
                          </div>

                          {/* Khung nội dung ảnh (Img Box) */}
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm inline-block w-full max-w-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-black text-xl text-[#E32626]">{act.distance} km</p>
                                <p className="text-xs text-gray-600 mt-0.5 truncate w-48">{act.eventTitle}</p>
                              </div>
                              <button 
                                onClick={() => handleDeleteActivity(act.id)}
                                className="text-red-500 hover:text-white hover:bg-red-500 border border-red-500 bg-white text-[10px] font-bold px-2 py-1 rounded-md transition-colors shadow-sm shrink-0"
                                title="Xóa kết quả này"
                              >
                                Xóa bỏ
                              </button>
                            </div>
                            
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                              <img src={act.proofImage} alt="Kết quả chạy" className="w-full h-auto max-h-48 object-cover hover:opacity-90 transition-opacity cursor-zoom-in" />
                            </div>
                          </div>

                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
   
  );
}