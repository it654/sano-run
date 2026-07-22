import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { registrationId, distance, proofImage, runDate } = body;

    if (!registrationId || !distance || !proofImage || !runDate) {
      return NextResponse.json({ error: 'Vui lòng điền đủ thông tin' }, { status: 400 });
    }

    // XỬ LÝ LÀM TRÒN: 
    // Ép kiểu sang Float, làm tròn 2 chữ số thập phân (toFixed(2)), rồi ép kiểu lại thành Float để lưu vào DB
    const roundedDistance = parseFloat(parseFloat(distance).toFixed(2));

    // Chặn trường hợp người dùng nhập chữ linh tinh hoặc số âm
    if (isNaN(roundedDistance) || roundedDistance <= 0) {
        return NextResponse.json({ error: 'Khoảng cách nhập vào không hợp lệ' }, { status: 400 });
    }

    // Dùng Transaction để đảm bảo tính đồng bộ giống như lúc Xóa (Nếu 1 trong 2 lỗi thì hủy cả 2)
    const [newActivity] = await prisma.$transaction([
        // 1. Tạo mới một bản ghi kết quả chạy
        prisma.activity.create({
          data: {
            registrationId,
            distance: roundedDistance, // Dùng biến đã làm tròn
            proofImage,
            runDate: new Date(runDate), 
            status: 'PENDING', 
          }
        }),

        // 2. Cộng dồn km vào bảng Đăng ký
        prisma.registration.update({
          where: { id: registrationId },
          data: {
            totalDistance: {
              increment: roundedDistance // Dùng biến đã làm tròn
            }
          }
        })
    ]);

    return NextResponse.json({ success: true, data: newActivity });
  } catch (error) {
    console.error("Lỗi khi lưu kết quả:", error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}