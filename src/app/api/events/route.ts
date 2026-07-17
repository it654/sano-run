// src/app/api/events/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


// API Lấy danh sách (Đã làm)
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

// [MỚI] API Tạo giải chạy mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, bannerUrl, location, date, deadline, status, distances, description } = body;

    // Validate cơ bản
    if (!title || !location || !date || !deadline || !distances) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' }, { status: 400 });
    }

    // Tạo mới trong DB
    const newEvent = await prisma.event.create({
      data: {
        title,
        banner: bannerUrl || null,
        location,
        date: new Date(date), // Chuyển chuỗi YYYY-MM-DD thành Date object
        registrationDeadline: new Date(deadline),
        status: status || 'UPCOMING',
        distances,
        prizes, 
        rules
        // Nếu schema Prisma của bạn có thêm trường description (Rich text), hãy thêm vào đây
        // description: description, 
      }
    });

    return NextResponse.json({ message: 'Tạo giải chạy thành công!', data: newEvent }, { status: 201 });
  } catch (error) {
    console.error("POST Event Error:", error);
    return NextResponse.json({ error: 'Lỗi hệ thống khi tạo giải chạy.' }, { status: 500 });
  }
}