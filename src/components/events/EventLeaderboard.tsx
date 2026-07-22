import React from 'react';

interface EventLeaderboardProps {
    data: any[];
}

export default function EventLeaderboard({ data }: EventLeaderboardProps) {
    // Sắp xếp giảm dần theo tổng KM
    const sortedData = [...data].sort((a, b) => (b.totalDistance || 0) - (a.totalDistance || 0));
    
    // Tách riêng Nam (true hoặc null) và Nữ (false)
    const maleList = sortedData.filter(r => r.gender !== false);
    const femaleList = sortedData.filter(r => r.gender === false);

    const renderTable = (list: any[], title: string, colorClass: string, isFemale: boolean) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full h-full flex flex-col">
            <div className={`p-4 ${colorClass} text-white font-black uppercase text-center flex items-center justify-center gap-2`}>
                {isFemale ? '🏃‍♀️' : '🏃'} {title}
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-[#F4F5F7] text-[#2B2D31] uppercase text-[10px] font-black tracking-wider border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-center w-12">Hạng</th>
                            <th className="px-4 py-3">Vận động viên</th>
                            <th className="px-4 py-3 text-center">Cự ly</th>
                            <th className="px-4 py-3 text-center">Kết quả</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {list.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">Chưa có dữ liệu</td></tr>
                        ) : (
                            list.map((row, idx) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-center font-black text-lg">
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-gray-400 text-sm">{idx + 1}</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-gray-900 leading-tight">{row.fullName || row.user?.name}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{row.bibNumber} | {row.department || '-'}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-bold text-[10px]">{row.distance}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-black text-[#E32626]">
                                        {parseFloat(Number(row.totalDistance || 0).toFixed(2))} km
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
            <div className="w-full lg:w-1/2">{renderTable(maleList, 'Bảng xếp hạng Nam', 'bg-[#1e3a8a]', false)}</div>
            <div className="w-full lg:w-1/2">{renderTable(femaleList, 'Bảng xếp hạng Nữ', 'bg-[#d81b60]', true)}</div>
        </div>
    );
}