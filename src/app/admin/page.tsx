'use client';

import Navbar from '@/components/layout/Navbar';
import { useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import dynamic from 'next/dynamic';
import EventLeaderboard from '@/components/events/EventLeaderboard';

const JoditEditor = dynamic(() => import('jodit-react'), {
    ssr: false,
    loading: () => <p className="text-gray-400 text-sm p-4 animate-pulse">Đang tải trình soạn thảo...</p>
});


export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'registrations' | 'events' | 'settings'>('registrations');
    
    // [MỚI] State chuyển đổi giữa bảng Danh sách và Bảng Xếp Hạng
    const [regViewMode, setRegViewMode] = useState<'list' | 'leaderboard'>('list');

    // =================================================================
    // STATE: CÀI ĐẶT HỆ THỐNG
    // =================================================================
    const [globalSettings, setGlobalSettings] = useState<Record<string, string>>({});
    const [isSavingSetting, setIsSavingSetting] = useState(false);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setGlobalSettings(data);
            }
        } catch (error) {
            console.error('Lỗi khi tải cài đặt:', error);
        }
    };

    const toggleSetting = async (key: string, currentValue: string) => {
        const newValue = currentValue === 'true' ? 'false' : 'true';
        setIsSavingSetting(true);
        setGlobalSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value: newValue })
            });
            if (!res.ok) {
                alert('Lỗi khi lưu cài đặt!');
                setGlobalSettings(prev => ({ ...prev, [key]: currentValue }));
            }
        } catch (error) {
            alert('Lỗi hệ thống khi lưu cài đặt.');
            setGlobalSettings(prev => ({ ...prev, [key]: currentValue }));
        } finally {
            setIsSavingSetting(false);
        }
    };

    // =================================================================
    // STATE: ĐƠN ĐĂNG KÝ
    // =================================================================
    const [registrationsData, setRegistrationsData] = useState<any[]>([]);
    const [isLoadingRegs, setIsLoadingRegs] = useState(true);
    const [isRegModalOpen, setIsRegModalOpen] = useState(false);
    const [selectedReg, setSelectedReg] = useState<any>(null);
    const openRegDetails = (reg: any) => {
        setSelectedReg(reg);
        setIsRegModalOpen(true);
    };

    // =================================================================
    // STATE: GIẢI CHẠY
    // =================================================================
    const [eventsData, setEventsData] = useState<any[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [selectedFilterEvent, setSelectedFilterEvent] = useState('Tất cả');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);

    const [editorContent, setEditorContent] = useState('');
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [prizesContent, setPrizesContent] = useState('');
    const [rulesContent, setRulesContent] = useState('');
    const [selectedDistances, setSelectedDistances] = useState<string>('');
    const editorConfig = useMemo(() => ({
        readonly: false,
        placeholder: 'Viết thông tin chi tiết giải chạy...',
        height: 450,
        toolbarButtonSize: 'middle' as const,
        buttons: ['bold', 'italic', 'underline', 'strikethrough', '|', 'ul', 'ol', '|', 'font', 'fontsize', 'brush', 'paragraph', '|', 'image', 'link', 'align', 'undo', 'redo', 'eraser']
    }), []);
    const [activeEditorTab, setActiveEditorTab] = useState<'desc' | 'prizes' | 'rules'>('desc');

    const fetchEvents = async () => {
        setIsLoadingEvents(true);
        try {
            const response = await fetch('/api/events');
            if (response.ok) {
                const data = await response.json();
                setEventsData(data);
            }
        } catch (error) {
            console.error('Fetch events error:', error);
        } finally {
            setIsLoadingEvents(false);
        }
    };

    const fetchRegistrations = async () => {
        setIsLoadingRegs(true);
        try {
            const response = await fetch('/api/admin/registrations');
            if (response.ok) {
                const data = await response.json();
                setRegistrationsData(data);
            }
        } catch (error) {
            console.error('Fetch registrations error:', error);
        } finally {
            setIsLoadingRegs(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchRegistrations();
        fetchSettings(); 
    }, []);

    const uniqueEventsFilter = ['Tất cả', ...Array.from(new Set(registrationsData.map(item => item.event?.title).filter(Boolean)))];
    const filteredRegistrations = selectedFilterEvent === 'Tất cả'
        ? registrationsData
        : registrationsData.filter(reg => reg.event?.title === selectedFilterEvent);

    const handleExportExcel = () => {
        const exportData = filteredRegistrations.map((item, index) => ({
            'STT': index + 1,
            'Số BIB': item.bibNumber,
            'Họ và Tên': item.fullName || item.user?.name,
            'Email': item.user?.email,
            'Giới tính': item.gender === false ? 'Nữ' : 'Nam', // Bổ sung cột giới tính khi xuất Excel
            'Phòng ban': item.department || 'N/A',
            'Giải Chạy': item.event?.title,
            'Cự Ly': item.distance,
            'Tổng KM Đã Chạy': parseFloat(Number(item.totalDistance || 0).toFixed(2))
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSach');
        XLSX.writeFile(workbook, `DanhSachDangKy_${selectedFilterEvent}.xlsx`);
    };

    const openCreateModal = () => {
        setEditingEvent(null);
        setEditorContent('');
        setBannerPreview(null);
        setBannerUrl(null);
        setSelectedDistances('');
        setPrizesContent('');
        setRulesContent('');
        setIsEventModalOpen(true);
    };

    const openEditModal = (eventData: any) => {
        setEditingEvent(eventData);
        setEditorContent(eventData.description || '');
        setBannerUrl(eventData.banner || null);
        setBannerPreview(eventData.banner || null);
        setPrizesContent(eventData.prizes || '');
        setRulesContent(eventData.rules || '');
        setSelectedDistances(eventData.distances || '');
        setIsEventModalOpen(true);
    };

    const handleDeleteEvent = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa giải chạy này? (Tất cả đơn đăng ký liên quan sẽ bị xóa)')) {
            try {
                const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    alert('Đã xóa giải chạy thành công!');
                    setEventsData(eventsData.filter(ev => ev.id !== id));
                    fetchRegistrations();
                } else {
                    const err = await res.json();
                    alert(`Lỗi: ${err.error}`);
                }
            } catch (error) {
                alert('Lỗi hệ thống khi xóa.');
            }
        }
    };

    const handleDeleteRegistration = async (id: string) => {
        if (window.confirm('Hành động này sẽ xóa đơn đăng ký và mọi kết quả chạy của nhân sự này. Bạn có chắc không?')) {
            try {
                const res = await fetch(`/api/admin/registrations/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    alert('Đã xóa đơn đăng ký thành công!');
                    fetchRegistrations();
                } else {
                    const err = await res.json();
                    alert(`Lỗi: ${err.error}`);
                }
            } catch (error) {
                alert('Lỗi hệ thống khi xóa đơn đăng ký.');
            }
        }
    }

    const handleSaveEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const rawDeadline = formData.get('deadline') as string;
        const deadlineUTC = rawDeadline ? new Date(rawDeadline).toISOString() : '';
        const payload = {
            title: formData.get('title') as string,
            date: formData.get('date') as string,
            endDate: formData.get('endDate') as string,
            deadline: deadlineUTC,
            location: formData.get('location') as string,
            distances: selectedDistances,
            status: formData.get('status') as string,
            description: editorContent,
            prizes: prizesContent,
            rules: rulesContent,
            bannerUrl: bannerUrl,
        };

        try {
            const url = editingEvent ? `/api/events/${editingEvent.id}` : `/api/events`;
            const method = editingEvent ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert(editingEvent ? 'Cập nhật giải chạy thành công!' : 'Thêm giải chạy mới thành công!');
                fetchEvents();
                setIsEventModalOpen(false);
            } else {
                const err = await res.json();
                alert(`Lỗi: ${err.error}`);
            }
        } catch (error) {
            alert('Lỗi hệ thống, vui lòng thử lại.');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBannerPreview(URL.createObjectURL(file));
        const formData = new FormData();
        formData.append('image', file);

        try {
            setIsUploading(true);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (res.ok && data.url) {
                setBannerUrl(data.url);
            } else {
                alert("Lỗi upload ảnh: " + (data.error || "Không xác định"));
                setBannerPreview(null);
            }
        } catch (error) {
            alert("Đã xảy ra lỗi khi upload ảnh!");
            setBannerPreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleToggleDistance = (dist: string) => {
        let currentArr = selectedDistances.split(',').map(s => s.trim()).filter(Boolean);
        if (currentArr.includes(dist)) {
            currentArr = currentArr.filter(item => item !== dist);
        } else {
            currentArr.push(dist);
        }
        setSelectedDistances(currentArr.join(', '));
    };

    return (
        <>
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                <div className="mb-6">
                    <span className="text-[#E32626] font-bold text-sm uppercase tracking-wider">Khu vực quản trị</span>
                    <h1 className="text-3xl font-black text-[#1e3a8a] uppercase tracking-tight mt-1">Admin Dashboard</h1>
                </div>

                {/* MENU TABS */}
                <div className="flex space-x-8 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('registrations')}
                        className={`pb-3 font-black uppercase text-sm tracking-wider transition-colors ${activeTab === 'registrations' ? 'border-b-4 border-[#E32626] text-[#E32626]' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Đơn Đăng Ký
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`pb-3 font-black uppercase text-sm tracking-wider transition-colors ${activeTab === 'events' ? 'border-b-4 border-[#E32626] text-[#E32626]' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Quản Lý Giải Chạy
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-3 font-black uppercase text-sm tracking-wider transition-colors ${activeTab === 'settings' ? 'border-b-4 border-[#E32626] text-[#E32626]' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Cài đặt
                    </button>
                </div>

                {/* ==================== TAB: CÀI ĐẶT HỆ THỐNG ==================== */}
                {activeTab === 'settings' && (
                    <div className="animate-in fade-in duration-300 max-w-3xl">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-black text-[#1e3a8a] uppercase tracking-tight">Cấu hình hiển thị</h2>
                                <p className="text-sm text-gray-500 mt-1">Quản lý các tính năng bật/tắt trên toàn bộ hệ thống web.</p>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Hiển thị Tab Kết Quả (Bảng xếp hạng)</h3>
                                        <p className="text-xs text-gray-500 mt-1">Bật tính năng này sẽ hiển thị tab Kết quả ở trang chi tiết của mọi giải chạy.</p>
                                    </div>
                                    <button 
                                        type="button"
                                        disabled={isSavingSetting}
                                        onClick={() => toggleSetting('SHOW_RESULTS_TAB', globalSettings['SHOW_RESULTS_TAB'] || 'false')}
                                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${globalSettings['SHOW_RESULTS_TAB'] === 'true' ? 'bg-[#E32626]' : 'bg-gray-300'} ${isSavingSetting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${globalSettings['SHOW_RESULTS_TAB'] === 'true' ? 'translate-x-7' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================== TAB: DANH SÁCH ĐĂNG KÝ VÀ BẢNG XẾP HẠNG ==================== */}
                {activeTab === 'registrations' && (
                    <div className="animate-in fade-in duration-300">
                        {/* Khu vực Filter và Nút chuyển đổi View Mode */}
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100 w-full md:w-auto">
                                <span className="pl-2 font-bold text-sm text-gray-500 shrink-0">Lọc giải:</span>
                                <select
                                    className="bg-gray-50 border border-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E32626] text-sm w-full md:w-64"
                                    value={selectedFilterEvent}
                                    onChange={(e) => setSelectedFilterEvent(e.target.value)}
                                >
                                    {uniqueEventsFilter.map((ev, idx) => <option key={idx} value={ev}>{ev as string}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                {/* [MỚI] Khối Nút Chuyển Đổi (Toggle) */}
                                <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200 w-full sm:w-auto">
                                    <button 
                                        onClick={() => setRegViewMode('list')}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${regViewMode === 'list' ? 'bg-white shadow-sm text-[#E32626]' : 'text-gray-500 hover:text-gray-800'}`}
                                    >
                                        📄 Danh sách
                                    </button>
                                    <button 
                                        onClick={() => setRegViewMode('leaderboard')}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${regViewMode === 'leaderboard' ? 'bg-white shadow-sm text-[#E32626]' : 'text-gray-500 hover:text-gray-800'}`}
                                    >
                                        🏆 Bảng xếp hạng
                                    </button>
                                </div>

                                <button
                                    onClick={handleExportExcel}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm w-full sm:w-auto shrink-0"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Xuất Excel ({filteredRegistrations.length})
                                </button>
                            </div>
                        </div>

                        {/* RENDER DỰA THEO VIEW MODE ĐÃ CHỌN */}
                        {regViewMode === 'list' ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-600">
                                        <thead className="bg-[#F4F5F7] text-[#2B2D31] uppercase text-[11px] font-black tracking-wider border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4">Mã BIB</th>
                                                <th className="px-6 py-4">Họ và Tên</th>
                                                <th className="px-6 py-4 text-center">Giới tính</th>
                                                <th className="px-6 py-4">Phòng ban</th>
                                                <th className="px-6 py-4">Giải Chạy</th>
                                                <th className="px-6 py-4 text-center">Cự Ly</th>
                                                <th className="px-6 py-4 text-center">Hoàn thành</th>
                                                <th className="px-6 py-4 text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {isLoadingRegs ? (
                                                <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                                            ) : filteredRegistrations.length === 0 ? (
                                                <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500">Chưa có ai đăng ký giải này.</td></tr>
                                            ) : (
                                                filteredRegistrations.map((row) => (
                                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{row.bibNumber}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-bold text-[#1e3a8a]">{row.fullName || row.user?.name}</span> <br />
                                                            <span className="text-[10px] text-gray-400">{row.user?.email}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-bold">
                                                            {row.gender === false ? <span className="text-pink-500 bg-pink-50 px-2 py-0.5 rounded">Nữ</span> : <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Nam</span>}
                                                        </td>
                                                        <td className="px-6 py-4 font-medium">{row.department || '-'}</td>
                                                        <td className="px-6 py-4 font-bold text-gray-700">{row.event?.title}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full font-bold text-[11px]">{row.distance}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="font-black text-[#E32626]">{parseFloat(Number(row.totalDistance || 0).toFixed(2))}</span> km
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-xs space-x-4">
                                                            <button onClick={() => openRegDetails(row)} className="text-blue-500 hover:text-blue-700 font-bold uppercase transition-colors">Chi tiết</button>
                                                            <button onClick={() => handleDeleteRegistration(row.id)} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Xóa</button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <EventLeaderboard data={filteredRegistrations} />
                        )}
                    </div>
                )}

                {/* ==================== TAB: QUẢN LÝ GIẢI CHẠY ==================== */}
                {activeTab === 'events' && (
                    <div className="animate-in fade-in duration-300">
                        <div className="mb-6 flex justify-end">
                            <button
                                onClick={openCreateModal}
                                className="bg-[#E32626] hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors flex items-center gap-2 text-sm uppercase tracking-wider"
                            >
                                + Thêm giải chạy mới
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-[#F4F5F7] text-[#2B2D31] uppercase text-xs font-black tracking-wider border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Ảnh & Tên Giải</th>
                                            <th className="px-6 py-4">Lịch trình</th>
                                            <th className="px-6 py-4 text-center">Trạng thái</th>
                                            <th className="px-6 py-4 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {isLoadingEvents ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">Đang tải dữ liệu...</td>
                                            </tr>
                                        ) : eventsData.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">Chưa có giải chạy nào được tạo.</td>
                                            </tr>
                                        ) : (
                                            eventsData.map((ev) => {
                                                const runDate = new Date(ev.date).toLocaleDateString('vi-VN');
                                                const endDate = ev.endDate ? new Date(ev.endDate).toLocaleDateString('vi-VN') : '';
                                                const deadlineDate = ev.registrationDeadline
                                                    ? new Date(ev.registrationDeadline).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
                                                    : '';

                                                return (
                                                    <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 flex items-center gap-4">
                                                            <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                                                {ev.banner ? <img src={ev.banner} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px]">No img</div>}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-[#1e3a8a] truncate max-w-[250px]">{ev.title}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{ev.location}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-medium text-gray-900 text-xs">Từ: {runDate} - {endDate}</p>
                                                            <p className="text-xs text-red-600 mt-1 font-bold">Đóng ĐK: {deadlineDate}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {ev.status === 'OPEN' && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Đang mở</span>}
                                                            {ev.status === 'UPCOMING' && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Sắp tới</span>}
                                                            {ev.status === 'DOING' && <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Đang diễn ra</span>}
                                                            {ev.status === 'CLOSED' && <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Kết thúc</span>}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => {
                                                                const formatDateTimeLocal = (d: string) => {
                                                                    if (!d) return '';
                                                                    const dateObj = new Date(d);
                                                                    dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
                                                                    return dateObj.toISOString().slice(0, 16); 
                                                                };

                                                                openEditModal({
                                                                    ...ev,
                                                                    date: ev.date ? new Date(ev.date).toISOString().split('T')[0] : '',
                                                                    endDate: ev.endDate ? new Date(ev.endDate).toISOString().split('T')[0] : '',
                                                                    deadline: formatDateTimeLocal(ev.registrationDeadline)
                                                                });
                                                            }}
                                                                className="text-blue-600 hover:text-blue-800 font-bold text-xs mr-4 uppercase"
                                                            >
                                                                Sửa
                                                            </button>
                                                            <button onClick={() => handleDeleteEvent(ev.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">Xóa</button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL THÊM/SỬA GIẢI CHẠY */}
            {isEventModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-[#F4F5F7] px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">
                                {editingEvent ? 'Chỉnh sửa thông tin giải chạy' : 'Tạo giải chạy mới'}
                            </h2>
                            <button onClick={() => setIsEventModalOpen(false)} className="text-gray-500 hover:text-red-600 bg-white rounded-full p-1.5 shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSaveEvent} className="flex flex-col flex-grow overflow-hidden">
                            <div className="flex flex-col md:flex-row flex-grow overflow-y-auto">
                                <div className="w-full md:w-1/3 p-6 border-r border-gray-100 bg-gray-50/50 space-y-5 overflow-y-auto">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Ảnh Banner <span className="text-red-500">*</span></label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-white hover:border-[#E32626] transition-colors relative group">
                                            <div className="space-y-1 text-center">
                                                {bannerPreview ? (
                                                    <div className="relative w-full h-24 rounded-lg overflow-hidden">
                                                        <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                                <div className="flex text-sm text-gray-600 justify-center mt-2">
                                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#E32626] hover:text-red-500">
                                                        <span>{isUploading ? 'Đang tải...' : (bannerPreview ? 'Đổi ảnh' : 'Tải ảnh lên')}</span>
                                                        <input type="file" name="banner" className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tên giải chạy <span className="text-red-500">*</span></label>
                                        <input type="text" name="title" required defaultValue={editingEvent?.title} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E32626] text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Bắt đầu <span className="text-red-500">*</span></label>
                                        <input type="date" name="date" required defaultValue={editingEvent?.date} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E32626] text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kết thúc <span className="text-red-500">*</span></label>
                                        <input type="date" name="endDate" required defaultValue={editingEvent?.endDate} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E32626] text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hạn Đăng ký (Ngày & Giờ) <span className="text-red-500">*</span></label>
                                        <input type="datetime-local" name="deadline" required defaultValue={editingEvent?.deadline} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E32626] text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Địa điểm <span className="text-red-500">*</span></label>
                                        <input type="text" name="location" required defaultValue={editingEvent?.location} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E32626] text-sm" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cự ly <span className="text-red-500">*</span></label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {['5KM', '10KM', '21KM', '42KM'].map((dist) => {
                                                    const isSelected = selectedDistances.includes(dist);
                                                    return (
                                                        <button
                                                            key={dist}
                                                            type="button"
                                                            onClick={() => handleToggleDistance(dist)}
                                                            className={`px-3 py-1.5 text-[11px] font-bold rounded-md border transition-colors ${isSelected
                                                                ? 'bg-[#E32626] text-white border-[#E32626]'
                                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            {dist}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <input
                                                type="text"
                                                name="distances"
                                                required
                                                value={selectedDistances}
                                                onChange={(e) => setSelectedDistances(e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E32626] text-sm"
                                                placeholder="VD: 5KM, 10KM"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Trạng thái</label>
                                            <select name="status" defaultValue={editingEvent?.status || 'UPCOMING'} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E32626] text-sm font-bold">
                                                <option value="UPCOMING">Sắp tới</option>
                                                <option value="OPEN">Đang mở</option>
                                                <option value="DOING">Đang diễn ra</option>
                                                <option value="CLOSED">Đã kết thúc</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-2/3 p-6 flex flex-col h-[600px] md:h-auto border-l border-gray-100">
                                    <div className="flex space-x-2 border-b border-gray-200 mb-4">
                                        <button type="button" onClick={() => setActiveEditorTab('desc')} className={`px-4 py-2 text-sm font-bold uppercase transition-colors rounded-t-lg ${activeEditorTab === 'desc' ? 'bg-[#1e3a8a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Chi tiết giải</button>
                                        <button type="button" onClick={() => setActiveEditorTab('prizes')} className={`px-4 py-2 text-sm font-bold uppercase transition-colors rounded-t-lg ${activeEditorTab === 'prizes' ? 'bg-[#1e3a8a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Giải thưởng</button>
                                        <button type="button" onClick={() => setActiveEditorTab('rules')} className={`px-4 py-2 text-sm font-bold uppercase transition-colors rounded-t-lg ${activeEditorTab === 'rules' ? 'bg-[#1e3a8a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Điều lệ</button>
                                    </div>
                                    <div className="flex-grow bg-white rounded-lg overflow-hidden border border-gray-300 relative">
                                        <div className={`absolute inset-0 ${activeEditorTab === 'desc' ? 'block' : 'hidden'}`}>
                                            <JoditEditor value={editorContent} config={{ ...editorConfig, placeholder: 'Nhập thông tin chi tiết giải chạy...' }} onBlur={(newContent) => setEditorContent(newContent)} />
                                        </div>
                                        <div className={`absolute inset-0 ${activeEditorTab === 'prizes' ? 'block' : 'hidden'}`}>
                                            <JoditEditor value={prizesContent} config={{ ...editorConfig, placeholder: 'Nhập cơ cấu giải thưởng...' }} onBlur={(newContent) => setPrizesContent(newContent)} />
                                        </div>
                                        <div className={`absolute inset-0 ${activeEditorTab === 'rules' ? 'block' : 'hidden'}`}>
                                            <JoditEditor value={rulesContent} config={{ ...editorConfig, placeholder: 'Nhập quy định, điều lệ giải chạy...' }} onBlur={(newContent) => setRulesContent(newContent)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border-t border-gray-100 p-4 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm uppercase transition-colors">Hủy</button>
                                <button type="submit" disabled={isUploading} className={`px-8 py-2.5 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E32626] hover:bg-red-700'} text-white font-bold rounded-lg text-sm uppercase shadow-md transition-colors`}>
                                    {isUploading ? 'Đang tải ảnh...' : (editingEvent ? 'Lưu thay đổi' : 'Tạo giải mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL CHI TIẾT ĐƠN ĐĂNG KÝ */}
            {isRegModalOpen && selectedReg && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-[#F4F5F7] px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">
                                Chi tiết kết quả - {selectedReg.bibNumber}
                            </h2>
                            <button onClick={() => setIsRegModalOpen(false)} className="text-gray-500 hover:text-red-600 bg-white rounded-full p-1.5 shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col flex-grow overflow-hidden space-y-6 bg-white">
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 shrink-0">
                                <h3 className="font-bold text-[#E32626] mb-4 uppercase text-sm border-b pb-2">Thông tin vận động viên</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-500 block text-xs mb-1">Họ và tên</span><span className="font-bold text-gray-900">{selectedReg.fullName || selectedReg.user?.name}</span></div>
                                    <div><span className="text-gray-500 block text-xs mb-1">Email</span><span className="font-medium text-gray-800">{selectedReg.user?.email}</span></div>
                                    <div><span className="text-gray-500 block text-xs mb-1">Phòng ban</span><span className="font-medium text-gray-800">{selectedReg.department || 'N/A'}</span></div>
                                    <div><span className="text-gray-500 block text-xs mb-1">Giới tính</span><span className="font-bold">{selectedReg.gender === false ? 'Nữ' : 'Nam'}</span></div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 shrink-0">
                                <h3 className="font-bold text-[#E32626] mb-4 uppercase text-sm border-b pb-2">Tiến độ giải chạy</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                                    <div className="col-span-2"><span className="text-gray-500 block text-xs mb-1">Tên giải đang tham gia</span><span className="font-bold text-gray-900">{selectedReg.event?.title}</span></div>
                                    <div><span className="text-gray-500 block text-xs mb-1">Cự ly mục tiêu</span><span className="font-bold text-gray-900">{selectedReg.distance}</span></div>
                                    <div><span className="text-gray-500 block text-xs mb-1">Tổng KM đã chạy</span><span className="font-black text-green-600 text-lg">{parseFloat(Number(selectedReg.totalDistance || 0).toFixed(2))} km</span></div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(((selectedReg.totalDistance || 0) / parseInt(selectedReg.distance || '1')) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex flex-col flex-grow overflow-hidden">
                                <h3 className="font-bold text-[#E32626] mb-4 uppercase text-sm border-b pb-2 shrink-0">Lịch sử nộp kết quả</h3>
                                {selectedReg.activities && selectedReg.activities.length > 0 ? (
                                    <div className="space-y-3 overflow-y-auto pr-2 flex-grow pb-2">
                                        {selectedReg.activities.map((act: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center bg-white p-4 border border-gray-100 rounded-xl shadow-sm shrink-0">
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{new Date(act.runDate).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-2">
                                                    <p className="font-black text-green-600">+{parseFloat(Number(act.distance || 0).toFixed(2))} km</p>
                                                    {act.proofImage && (
                                                        <div
                                                            onClick={() => setPreviewImage(act.proofImage)}
                                                            className="cursor-pointer group relative rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                                                            title="Bấm để xem ảnh lớn"
                                                        >
                                                            <img src={act.proofImage} alt="Bằng chứng" className="w-12 h-12 object-cover group-hover:scale-110 transition-transform duration-300" />
                                                            <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center transition-all">
                                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center shrink-0">
                                        <p className="text-sm text-gray-500 font-medium">Vận động viên này chưa nộp kết quả chạy nào.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {previewImage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-200">
                        <button onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 text-white/70 hover:text-white bg-black/50 hover:bg-red-500 rounded-full p-2 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <img src={previewImage} alt="Ảnh bằng chứng lớn" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
                    </div>
                </div>
            )}
        </>
    );
}