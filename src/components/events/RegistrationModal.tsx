'use client'; 

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  eventId: string;
  eventDistances: string; // Bổ sung prop nhận chuỗi cự ly từ DB (VD: "5KM, 10KM")
}

export default function RegistrationModal({ isOpen, onClose, eventTitle, eventId, eventDistances }: RegistrationModalProps) {
  const { data: session } = useSession();

  // Tách chuỗi cự ly thành mảng để render. VD: "5KM, 10KM" -> ['5KM', '10KM']
  const distanceList = eventDistances ? eventDistances.split(',').map(d => d.trim()).filter(Boolean) : [];

  const [formData, setFormData] = useState({
    fullName: '',
    department: '',
    distance: '',
    healthCommit: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
      setErrorMessage('');
      setFormData({
        fullName: session?.user?.name || '',
        department: '',
        distance: '',
        healthCommit: false,
      });
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!session) {
      setErrorMessage('Vui lòng đăng nhập bằng Google trước khi đăng ký!');
      return;
    }

    if (!formData.distance) {
      setErrorMessage('Vui lòng chọn cự ly chạy!');
      return;
    }

    if (!formData.healthCommit) {
      setErrorMessage('Vui lòng đánh dấu vào ô Cam kết sức khỏe!');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          ...formData
        })
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
      } else {
        setErrorMessage(data.error || 'Có lỗi xảy ra từ máy chủ.');
      }
    } catch (error) {
      setErrorMessage('Lỗi kết nối mạng hoặc hệ thống.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4 transition-all duration-300 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-300 no-scrollbar">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div className="p-6 md:p-8">
          
          {!isSuccess ? (
            <>
              <div className="text-center mb-5 border-b border-gray-100 pb-4">
                <h2 className="text-2xl md:text-3xl font-black text-[#E32626] uppercase tracking-tight">Đăng ký tham gia</h2>
                <p className="text-gray-500 font-medium mt-1 text-sm">{eventTitle}</p>
              </div>

              {errorMessage && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-bold text-center">
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-[#2B2D31] mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-2.5 text-sm bg-[#F4F5F7] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E32626]/50 focus:bg-white transition-colors" 
                      placeholder="VD: Vũ Đức Minh"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2B2D31] mb-1.5">Phòng ban <span className="text-red-500">*</span></label>
                    <select 
                      required 
                      className="w-full px-4 py-2.5 text-sm bg-[#F4F5F7] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E32626]/50 focus:bg-white transition-colors"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    >
                      <option value="" disabled>Chọn team...</option>
                      <option value="Avenger">Avenger</option>
                      <option value="Tesla">Tesla</option>
                      <option value="Punch">Punch</option>
                      <option value="Punch">Rambo</option>
                      <option value="Attack">Attack</option>
                      <option value="Wevic">Wevic</option>
                      <option value="HR">Nhân sự</option>
      
                    </select>
                  </div>
                </div>

                {/* KHU VỰC CHỌN CỰ LY ĐỘNG */}
                <div className="mb-5">
                  <label className="block text-xs font-bold text-[#2B2D31] mb-2">Chọn cự ly chạy <span className="text-red-500">*</span></label>
                  
                  {distanceList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {distanceList.map((dist) => (
                        <label key={dist} className="cursor-pointer relative block">
                          <input 
                            type="radio" 
                            name="distance" 
                            value={dist} 
                            required 
                            className="peer sr-only"
                            checked={formData.distance === dist}
                            onChange={(e) => setFormData({...formData, distance: e.target.value})}
                          />
                          <div className="border-2 border-[#E5E7EB] rounded-xl p-3 text-center transition-colors peer-hover:border-red-300 peer-checked:border-[#E32626] peer-checked:bg-[#fef2f2] text-gray-900 peer-checked:text-[#E32626] h-full flex flex-col justify-center">
                            <span className="block text-lg md:text-xl font-black">{dist}</span>
                            <svg className="hidden peer-checked:block absolute top-1.5 right-1.5 w-4 h-4 text-[#E32626]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-red-500 italic">Giải chạy này chưa được thiết lập cự ly.</p>
                  )}
                </div>

                <div className="mb-6 bg-[#FFF8E6] border border-[#FDE29F] rounded-lg p-3.5 md:p-4">
                  <label className="flex items-start cursor-pointer">
                    <div className="flex items-center h-5">
                      <input 
                        type="checkbox" 
                        required 
                        className="w-4 h-4 text-[#E32626] bg-white border-gray-300 rounded focus:ring-[#E32626] focus:ring-2 mt-0.5"
                        checked={formData.healthCommit}
                        onChange={(e) => setFormData({...formData, healthCommit: e.target.checked})}
                      />
                    </div>
                    <div className="ml-3">
                      <span className="font-bold text-gray-900 block text-xs md:text-sm mb-0.5">Cam kết sức khỏe cá nhân</span>
                      <span className="text-gray-600 leading-relaxed text-[11px] md:text-xs">Tôi xác nhận mình hoàn toàn đủ thể lực để tham gia cự ly đã chọn và tự chịu trách nhiệm về các vấn đề sức khỏe trong sự kiện.</span>
                    </div>
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#E32626] hover:bg-red-700 text-white font-black text-base md:text-lg py-3.5 px-4 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 tracking-wide uppercase disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận & Đăng ký"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Đăng ký thành công!</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-sm leading-relaxed">
                Tuyệt vời! Bạn đã ghi danh thành công. Vui lòng vào trang hồ sơ để cập nhật tiến độ chạy nhé.
              </p>
              <button 
                onClick={onClose} 
                className="bg-[#2B2D31] hover:bg-black text-white font-bold py-3 px-8 rounded-xl transition-colors uppercase tracking-wider text-sm"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}