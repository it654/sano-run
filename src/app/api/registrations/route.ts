import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';



export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Kiểm tra đăng nhập
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để đăng ký giải chạy!' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    
    // Đã bỏ employeeId
    const { eventId, fullName, department, distance } = body;

    if (!eventId || !fullName || !department || !distance) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc (*)' }, { status: 400 });
    }

    // 2. Kiểm tra xem User này đã đăng ký giải này chưa (Chống đăng ký trùng)
    const existingReg = await prisma.registration.findFirst({
      where: { userId: userId, eventId: eventId }
    });

    if (existingReg) {
      return NextResponse.json({ error: 'Bạn đã đăng ký tham gia giải chạy này rồi!' }, { status: 400 });
    }

    // 3. Tạo số BIB ngẫu nhiên
    const randomBib = `HDAY-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Lưu vào Database
    const newRegistration = await prisma.registration.create({
      data: {
        userId,
        eventId,
        fullName,
        department,
        distance,
        bibNumber: randomBib,
      }
    });

    return NextResponse.json({ success: true, bib: randomBib, data: newRegistration });

  } catch (error) {
    console.error("Lỗi đăng ký giải chạy:", error);
    return NextResponse.json({ error: 'Lỗi hệ thống khi xử lý đăng ký' }, { status: 500 });
  }
}