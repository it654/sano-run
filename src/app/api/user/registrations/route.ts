import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';

// 1. Import authOptions (Lưu ý đường dẫn lùi lại 2 thư mục)
import { authOptions } from '../../auth/[...nextauth]/route'; 
import { prisma } from '@/lib/prisma';



export async function GET(request: Request) {
  try {
    // 2. Bắt buộc phải truyền authOptions vào đây
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Tìm tất cả đơn đăng ký của User này
    const registrations = await prisma.registration.findMany({
      where: { userId: userId },
      include: {
        event: true, // Lấy kèm thông tin Giải chạy
        activities: {
          orderBy: {
            runDate: 'desc' // Sắp xếp kết quả mới nhất lên đầu
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đăng ký:", error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}