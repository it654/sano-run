// src/app/api/events/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// API Lấy danh sách
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("GET Events Error:", error);
    return NextResponse.json({ error: 'Lỗi khi lấy danh sách giải chạy' }, { status: 500 });
  }
}

// API Tạo giải chạy mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, bannerUrl, location, date, deadline, status, distances, description, prizes, rules, endDate } = body;
    
    // Validate cơ bản
    if (!title || !location || !date || !deadline || !distances) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' }, { status: 400 });
    }

    // ==========================================
    // XỬ LÝ ÉP MÚI GIỜ VIỆT NAM CHO VPS MỸ
    // ==========================================
    // 1. Ngày bắt đầu / Kết thúc (YYYY-MM-DD): Ép thành đúng 00:00:00 giờ VN
    const parsedDate = date 
      ? new Date(date.includes('T') ? date : `${date}T00:00:00+07:00`).toISOString() 
      : undefined;
      
    const parsedEndDate = endDate 
      ? new Date(endDate.includes('T') ? endDate : `${endDate}T00:00:00+07:00`).toISOString() 
      : null; 
      
    // 2. Giờ Hạn chót (YYYY-MM-DDThh:mm): Cộng thêm +07:00 vào chuỗi form để VPS hiểu đây là giờ VN
    const parsedDeadline = deadline 
      ? new Date((deadline.includes('Z') || deadline.includes('+')) ? deadline : `${deadline}+07:00`).toISOString() 
      : undefined;

    // Tạo mới trong DB
    const newEvent = await prisma.event.create({
      data: {
        title,
        banner: bannerUrl || null,
        location,
        date: parsedDate as any, 
        registrationDeadline: parsedDeadline as any,
        status: status || 'UPCOMING',
        distances,
        prizes, 
        rules,
        endDate: parsedEndDate,
        // Đã mở comment dòng description để lưu đầy đủ nội dung bài viết
        description: description, 
      }
    });

    return NextResponse.json({ message: 'Tạo giải chạy thành công!', data: newEvent }, { status: 201 });
  } catch (error) {
    console.error("POST Event Error:", error);
    return NextResponse.json({ error: 'Lỗi hệ thống khi tạo giải chạy.' }, { status: 500 });
  }
}