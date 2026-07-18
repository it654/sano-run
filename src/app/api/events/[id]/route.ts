// src/app/api/events/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


// 1. API Đọc 1 giải chạy (GET)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Khai báo params là một Promise
) {
  try {
    // [QUAN TRỌNG] Phải await params để lấy id trong Next.js 15+
    const resolvedParams = await params;
    const eventId = resolvedParams.id;
    
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Không tìm thấy giải chạy' }, { status: 404 });
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error("GET Single Event Error:", error);
    return NextResponse.json({ error: 'Lỗi khi lấy dữ liệu giải chạy' }, { status: 500 });
  }
}

// 2. API Cập nhật giải chạy (PUT)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const resolvedParams = await params;
    const eventId = resolvedParams.id;
    
    const body = await request.json();
    const { title, bannerUrl, location, date, deadline, status, distances, description,prizes,rules,endDate } = body;

    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existingEvent) {
      return NextResponse.json({ error: 'Giải chạy không tồn tại' }, { status: 404 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        banner: bannerUrl || null,
        location,
        date: new Date(date),
        registrationDeadline: new Date(deadline),
        status,
        distances,
        description,
        prizes, 
        rules,
        endDate: new Date(endDate),
      }
    });

    return NextResponse.json({ message: 'Cập nhật thành công!', data: updatedEvent }, { status: 200 });
  } catch (error) {
    console.error("PUT Event Error:", error);
    return NextResponse.json({ error: 'Lỗi hệ thống khi cập nhật giải chạy.' }, { status: 500 });
  }
}

// 3. API Xóa giải chạy (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    await prisma.event.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ message: 'Xóa giải chạy thành công!' }, { status: 200 });
  } catch (error) {
    console.error("DELETE Event Error:", error);
    return NextResponse.json({ error: 'Lỗi hệ thống khi xóa giải chạy.' }, { status: 500 });
  }
}