'use client';
import React, { useState } from 'react';

interface EventLeaderboardProps {
    data: any[];
    onRefresh?: () => void;
}

export default function EventLeaderboard({ data, onRefresh }: EventLeaderboardProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    // Gọi API bật/tắt đoạt giải (Dạng số)
    const handleToggleWinner = async (id: string, currentWinnerStatus: number) => {
        let targetRank = 0;

        if (currentWinnerStatus > 0) {
            if (!window.confirm('Bạn muốn HỦY danh hiệu đoạt giải của VĐV này?')) return;
            targetRank = 0; // Trả về 0 (Đang đua)
        } else {
            const rankInput = window.prompt('Nhập thứ hạng cho VĐV này (VD: 1 = Nhất, 2 = Nhì, 3 = Ba...):', '1');
            if (rankInput === null) return; // Nếu người dùng bấm Hủy
            
            targetRank = parseInt(rankInput);
            if (isNaN(targetRank) || targetRank <= 0) {
                alert('Thứ hạng không hợp lệ! Vui lòng nhập số lớn hơn 0.');
                return;
            }
        }
        
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/registrations/${id}/winner`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isWinner: targetRank })
            });
            if (res.ok) {
                if (onRefresh) onRefresh();
            } else {
                alert('Có lỗi xảy ra!');
            }
        } catch (error) {
            alert('Lỗi hệ thống!');
        } finally {
            setIsProcessing(false);
        }
    };

    // 1. Sắp xếp chung toàn bộ VĐV theo KM giảm dần
    const sortedData = [...data].sort((a, b) => (b.totalDistance || 0) - (a.totalDistance || 0));
    
    // 2. Lọc danh sách ĐÃ ĐOẠT GIẢI và tách Nam/Nữ (sắp xếp theo hạng 1, 2, 3...)
    const maleWinnersList = sortedData
        .filter(r => r.isWinner > 0 && r.gender !== false)
        .sort((a, b) => a.isWinner - b.isWinner);
        
    const femaleWinnersList = sortedData
        .filter(r => r.isWinner > 0 && r.gender === false)
        .sort((a, b) => a.isWinner - b.isWinner);

    // 3. Lọc danh sách CHƯA ĐOẠT GIẢI (isWinner === 0) và tách Nam/Nữ
    const activeMaleList = sortedData.filter(r => r.isWinner === 0 && r.gender !== false);
    const activeFemaleList = sortedData.filter(r => r.isWinner === 0 && r.gender === false);

    const renderTable = (list: any[], title: string, colorClass: string, isWinnerTable: boolean = false) => (
        <div className={`bg-white rounded-2xl shadow-sm border ${isWinnerTable ? 'border-yellow-400' : 'border-gray-100'} overflow-hidden w-full h-full flex flex-col`}>
            <div className={`p-4 ${colorClass} text-white font-black uppercase text-center flex items-center justify-center gap-2`}>
                {isWinnerTable ? '🏆' : (title.includes('Nữ') ? '🏃‍♀️' : '🏃')} {title}
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-[#F4F5F7] text-[#2B2D31] uppercase text-[10px] font-black tracking-wider border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-center w-12">{isWinnerTable ? 'Giải' : 'Hạng'}</th>
                            <th className="px-4 py-3">Vận động viên</th>
                            <th className="px-4 py-3 text-center">Cự ly</th>
                            <th className="px-4 py-3 text-center">Kết quả</th>
                            <th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {list.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">Chưa có dữ liệu</td></tr>
                        ) : (
                            list.map((row, idx) => (
                                <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${isWinnerTable ? 'bg-yellow-50/30' : ''}`}>
                                    <td className="px-4 py-3 text-center font-black text-lg">
                                        {/* Bảng Vinh Danh in hạng giải thưởng. Bảng thường in thứ tự */}
                                        {isWinnerTable 
                                            ? (row.isWinner === 1 ? '🥇' : row.isWinner === 2 ? '🥈' : row.isWinner === 3 ? '🥉' : <span className="text-yellow-700 text-sm">Hạng {row.isWinner}</span>) 
                                            : (idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-gray-400 text-sm">{idx + 1}</span>)
                                        }
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className={`font-bold leading-tight ${isWinnerTable ? 'text-yellow-700' : 'text-gray-900'}`}>{row.fullName || row.user?.name}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{row.bibNumber} | {row.department || '-'}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-bold text-[10px]">{row.distance}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-black text-[#E32626]">
                                        {parseFloat(Number(row.totalDistance || 0).toFixed(2))} km
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            disabled={isProcessing}
                                            onClick={() => handleToggleWinner(row.id, row.isWinner || 0)}
                                            className={`text-[10px] font-bold px-2.5 py-1.5 rounded uppercase transition-colors shadow-sm ${
                                                row.isWinner > 0 
                                                ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' 
                                                : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                                            }`}
                                        >
                                            {row.isWinner > 0 ? 'Hủy giải' : 'Trao giải'}
                                        </button>
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
        <div className="flex flex-col gap-10 animate-in fade-in duration-500">
            {/* BẢNG VINH DANH NAM / NỮ (Chỉ hiện khi có ít nhất 1 người đoạt giải) */}
            {(maleWinnersList.length > 0 || femaleWinnersList.length > 0) && (
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:w-1/2">{renderTable(maleWinnersList, 'Vinh Danh Nam', 'bg-gradient-to-r from-yellow-400 to-yellow-600', true)}</div>
                    <div className="w-full lg:w-1/2">{renderTable(femaleWinnersList, 'Vinh Danh Nữ', 'bg-gradient-to-r from-yellow-400 to-yellow-600', true)}</div>
                </div>
            )}

            {/* BẢNG ĐANG ĐUA NAM / NỮ */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/2">{renderTable(activeMaleList, 'Đang đua top - Nam', 'bg-[#1e3a8a]', false)}</div>
                <div className="w-full lg:w-1/2">{renderTable(activeFemaleList, 'Đang đua top - Nữ', 'bg-[#d81b60]', false)}</div>
            </div>
        </div>
    );
}