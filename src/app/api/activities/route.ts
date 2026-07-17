import { NextResponse } from 'next/server';;
import { prisma } from '@/lib/prisma';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Bổ sung runDate
    const { registrationId, distance, proofImage, runDate } = body;

    if (!registrationId || !distance || !proofImage || !runDate) {
      return NextResponse.json({ error: 'Vui lòng điền đủ thông tin' }, { status: 400 });
    }

    // Tạo mới một bản ghi kết quả chạy
    const newActivity = await prisma.activity.create({
      data: {
        registrationId,
        distance: parseFloat(distance),
        proofImage,
        runDate: new Date(runDate), // Chuyển chuỗi YYYY-MM-DD thành kiểu Date
        status: 'PENDING', 
      }
    });

    // Cộng dồn km vào bảng Đăng ký (Hậu kiểm)
    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        totalDistance: {
          increment: parseFloat(distance)
        }
      }
    });

    return NextResponse.json({ success: true, data: newActivity });
  } catch (error) {
    console.error("Lỗi khi lưu kết quả:", error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}