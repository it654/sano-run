// src/app/api/register/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, fullName, distance, shirtSize, eventId } = body;

    // 1. Validate dữ liệu cơ bản
    if (!employeeId || !fullName || !distance || !shirtSize || !eventId) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin bắt buộc!' },
        { status: 400 }
      );
    }

    // 2. Kiểm tra giải chạy có tồn tại và đang mở không
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Giải chạy không tồn tại!' }, { status: 404 });
    }
    if (event.status === 'CLOSED') {
      return NextResponse.json({ error: 'Giải chạy này đã đóng đăng ký!' }, { status: 400 });
    }

    // 3. Kiểm tra xem nhân viên đã đăng ký giải này chưa
    const existingReg = await prisma.registration.findUnique({
      where: {
        employeeId_eventId: {
          employeeId: employeeId,
          eventId: eventId
        }
      }
    });

    if (existingReg) {
      return NextResponse.json(
        { error: `Nhân sự mang mã ${employeeId} đã đăng ký giải chạy này rồi!` },
        { status: 400 }
      );
    }

    // 4. Lưu vào Database
    const newRegistration = await prisma.registration.create({
      data: {
        employeeId,
        fullName,
        distance,
        shirtSize,
        eventId
      }
    });

    return NextResponse.json(
      { message: 'Đăng ký thành công!', data: newRegistration },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST Registration Error:", error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống khi xử lý đăng ký. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}