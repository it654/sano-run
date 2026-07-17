// src/app/api/register/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Cập nhật biến để hứng dữ liệu cho khớp với Schema mới
    // (Thay employeeId, shirtSize bằng userId, department)
    const { userId, fullName, department, distance, eventId } = body;

    // Validate dữ liệu cơ bản
    if (!userId || !fullName || !distance || !eventId) {
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

    // 3. KIỂM TRA TRÙNG LẶP: Dùng findFirst và tìm theo userId
    const existingReg = await prisma.registration.findFirst({
      where: {
        userId: userId,
        eventId: eventId
      }
    });

    if (existingReg) {
      return NextResponse.json(
        { error: `Bạn đã đăng ký tham gia giải chạy này rồi!` },
        { status: 400 }
      );
    }

    // 4. Tạo mã BIB ngẫu nhiên (Ví dụ: SANO-8542) vì Schema bắt buộc phải có
    const randomBib = `SANO-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Lưu vào Database
    const newRegistration = await prisma.registration.create({
      data: {
        userId,       // Dùng userId thay cho employeeId
        fullName,
        department,   // Dùng department thay cho shirtSize
        distance,
        eventId,
        bibNumber: randomBib // Bắt buộc phải có BIB
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