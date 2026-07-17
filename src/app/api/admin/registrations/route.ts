import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';



export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Kiểm tra đăng nhập (Bạn có thể thêm logic check Role Admin ở đây nếu có)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    // Lấy toàn bộ danh sách đăng ký
    const registrations = await prisma.registration.findMany({
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true } } // Lấy tên giải chạy để hiển thị và lọc
      },
      orderBy: {
        id: 'desc' // Đơn mới nhất lên đầu
      }
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Lỗi lấy danh sách đăng ký:", error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}