import Link from 'next/link';

interface EventCardProps {
  id: string; 
  title: string;
  date: string;
  location: string;
  status: 'UPCOMING' | 'OPEN' | 'CLOSED';
  distances: string;
  imageUrl?: string;
}

export default function EventCard({ id, title, date, location, status, distances, imageUrl }: EventCardProps) {
  const statusConfig = {
    UPCOMING: { text: 'Sắp tới', badge: 'bg-blue-100 text-blue-800' },
    OPEN: { text: 'Đang mở', badge: 'bg-green-100 text-green-800' },
    CLOSED: { text: 'Đã kết thúc', badge: 'bg-gray-200 text-gray-600' },
    DOING: { text: 'Đang diễn ra', badge: 'bg-red-200 text-red-600' },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-100 overflow-hidden group">
      {/* Thumbnail */}
      <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 font-black uppercase tracking-widest text-xs italic">
            No Banner
          </div>
        )}
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${statusConfig[status].badge}`}>
            {statusConfig[status].text}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Sự kiện nội bộ</span>
        <h3 className="text-lg font-black mb-3 line-clamp-2 uppercase text-blue-900 leading-tight italic tracking-wide">
          {title}
        </h3>
        
        <div className="text-xs text-gray-600 mb-5 space-y-1.5 font-medium">
          <p className="flex items-center"><span className="mr-2">📍</span>{location}</p>
          <p className="flex items-center"><span className="mr-2">📅</span>{date}</p>
          <p className="flex items-center font-bold text-gray-800"><span className="mr-2">🏃</span>{distances}</p>
        </div>

        {/* CẬP NHẬT: Trỏ href về /details/${id} */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link 
            href={`/details/${id}`} 
            className={`w-full py-2.5 px-4 rounded font-bold uppercase tracking-wider transition-colors duration-200 text-sm text-center block ${
              status === 'CLOSED' 
                ? 'bg-gray-100 text-gray-400 hover:bg-gray-200' 
                : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
            }`}>
             {status === 'CLOSED' ? 'Xem kết quả' : 'Xem chi tiết'}
          </Link>
        </div>
      </div>
    </div>
  );
}