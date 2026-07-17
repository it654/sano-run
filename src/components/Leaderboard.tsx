'use client';

import { useState, useEffect } from 'react';

interface LeaderboardProps {
  eventId: string;
}

export default function Leaderboard({ eventId }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (error) {
        console.error("Lỗi tải bảng xếp hạng", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchLeaderboard();
  }, [eventId]);

  if (isLoading) {
    return <div className="py-10 text-center text-gray-500 font-bold">Đang tải bảng xếp hạng...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-sans">
      <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">
          Bảng kết quả cá nhân
        </h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
          {leaderboard.length} Người tham gia
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold text-center w-16">Hạng</th>
              <th className="px-6 py-4 font-bold">Vận động viên</th>
              {/* <th className="px-6 py-4 font-bold text-center">BIB</th> */}
              <th className="px-6 py-4 font-bold text-center">Cự ly đăng ký</th>
              <th className="px-6 py-4 font-bold text-right text-[#E32626]">Kết quả (KM)</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                  Chưa có dữ liệu vận động viên tham gia.
                </td>
              </tr>
            ) : (
              leaderboard.map((runner, index) => (
                <tr key={runner.id} className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  
                  {/* Cột Hạng */}
                  <td className="px-6 py-4 text-center">
                    {index === 0 ? <span className="text-2xl">🥇</span> :
                     index === 1 ? <span className="text-2xl">🥈</span> :
                     index === 2 ? <span className="text-2xl">🥉</span> :
                     <span className="font-bold text-gray-500">{index + 1}</span>}
                  </td>

                  {/* Cột Vận động viên */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={runner.user?.image || 'https://via.placeholder.com/150'} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full border border-gray-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{runner.fullName || runner.user?.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{runner.department || 'Chưa cập nhật'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Cột BIB */}
                  {/* <td className="px-6 py-4 text-center font-semibold text-gray-600">
                    {runner.bibNumber}
                  </td> */}

                  {/* Cột Cự ly */}
                  <td className="px-6 py-4 text-center">
                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded">
                      {runner.distance || 'N/A'}
                    </span>
                  </td>

                  {/* Cột Kết quả (Tổng KM) */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-black text-[#E32626]">
                      {runner.totalDistance.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 font-bold ml-1">km</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}