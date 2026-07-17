'use client';

import { useState } from 'react';
import Leaderboard from './Leaderboard';

interface EventDetailTabsProps {
  eventId: string;
  eventData: any;      
  showResults: boolean; 
}

export default function EventDetailTabs({ eventId, eventData, showResults }: EventDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('chi-tiet');

  const formatCleanHTML = (html: string) => {
    if (!html) return { __html: '<p class="text-gray-500 italic mt-4">Chưa có thông tin chi tiết.</p>' };
    let cleanHtml = html.replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ');
    cleanHtml = cleanHtml.replace(/<(p|div|h[1-6]|li)([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, innerHtml) => {
        const rawText = innerHtml.replace(/<[^>]+>/g, '').trim();
        if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\./i.test(rawText)) {
            return `<h3 class="text-xl md:text-2xl font-black text-[#1e3a8a] uppercase mt-5 mb-5 border-l-[5px] border-[#E32626] pl-4 py-2 bg-[#F4F5F7] rounded-r-xl shadow-sm tracking-wide block">${innerHtml}</h3>`;
        }
        if (/^[1-9][0-9]*\./.test(rawText)) {
            return `<h4 class="text-lg font-bold text-gray-900 mt-8 mb-3 pb-1 border-b-2 border-gray-100 inline-block w-full">${innerHtml}</h4>`;
        }
        if (/^-/.test(rawText)) {
            const modifiedInner = innerHtml.replace(/(^|>)(?:\s)*-/, '$1');
            return `<div class="flex items-start mb-3 leading-relaxed"><span class="text-[#E32626] text-xl font-bold mr-3 mt-[-2px]">•</span><div class="text-gray-700 flex-1">${modifiedInner}</div></div>`;
        }
        return match;
    });
    return { __html: cleanHtml };
  };

  let tabs = [
    {
      id: 'chi-tiet',
      label: 'Chi tiết',
      icon: (
        <svg className="w-7 h-7 mb-1.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      )
    },
    {
      id: 'giai-thuong',
      label: 'Giải thưởng',
      icon: (
        <svg className="w-7 h-7 mb-1.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l-2.42 2.42c-.22.22-.58.22-.8 0L6.36 2l1.64 4.36c.09.24.09.52 0 .76L6.36 11.5l2.42-2.42c.22-.22.58-.22.8 0L12 11.5l2.42-2.42c.22-.22.58-.22.8 0l2.42 2.42-1.64-4.38c-.09-.24-.09-.52 0-.76L17.64 2l-2.42 2.42c-.22.22-.58.22-.8 0L12 2zm0 11.5L8.5 17v5l3.5-1.5 3.5 1.5v-5L12 13.5z" />
        </svg>
      )
    },
    {
      id: 'dieu-le',
      label: 'Điều lệ',
      icon: (
        <svg className="w-7 h-7 mb-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    }
  ];

  if (showResults) {
    tabs.push({
      id: 'ket-qua',
      label: 'Kết quả',
      icon: (
        <svg className="w-7 h-7 mb-1.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 20h16v2H4v-2zM6 16h3v-9H6v9zm5 0h3v-4h-3v4zm5 0h3V3h-3v13z" />
        </svg>
      )
    });
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start font-sans">
      {/* CỘT TRÁI: TABS MENU */}
      <div className="w-full md:w-32 bg-[#F8F9FA] rounded-[20px] flex flex-row md:flex-col shrink-0 sticky top-24 overflow-hidden border border-gray-100 shadow-sm z-10">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            // CHỈ GIỮ LẠI onClick, ĐÃ XÓA onMouseEnter
            onClick={() => setActiveTab(tab.id)} 
            className={`
              flex-1 md:w-full flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-200
              ${activeTab === tab.id 
                ? 'text-[#1B2A47] font-bold bg-white shadow-[0_0_15px_rgba(0,0,0,0.03)] scale-105 rounded-xl my-1 mx-1' 
                : 'text-[#8E95A3] font-medium hover:text-gray-600 hover:bg-gray-100/50'
              }
              ${index !== tabs.length - 1 && activeTab !== tab.id ? 'border-b border-gray-200/60' : ''}
            `}
          >
            {tab.icon}
            <span className="text-[13px] text-center tracking-tight mt-1">{tab.label}</span>
          </div>
        ))}
      </div>

      {/* CỘT PHẢI: KHU VỰC NỘI DUNG */}
      <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[600px] transition-all duration-300">
        
        <div className={`animate-in fade-in duration-500 ${activeTab === 'chi-tiet' ? 'block' : 'hidden'}`}>
           <div
              className="format-html text-gray-800 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={formatCleanHTML(eventData?.description)}
           />
        </div>

        <div className={`animate-in fade-in duration-500 ${activeTab === 'giai-thuong' ? 'block' : 'hidden'}`}>
           <div
              className="format-html text-gray-800 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={formatCleanHTML(eventData?.prizes || '<p class="italic text-gray-500">Chưa cập nhật thông tin giải thưởng.</p>')}
           />
        </div>

        <div className={`animate-in fade-in duration-500 ${activeTab === 'dieu-le' ? 'block' : 'hidden'}`}>
           <div
              className="format-html text-gray-800 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={formatCleanHTML(eventData?.rules || '<p class="italic text-gray-500">Chưa cập nhật điều lệ giải chạy.</p>')}
           />
        </div>

        {showResults && (
          <div className={`animate-in fade-in duration-500 ${activeTab === 'ket-qua' ? 'block' : 'hidden'}`}>
            <Leaderboard eventId={eventId} />
          </div>
        )}

      </div>
    </div>
  );
}