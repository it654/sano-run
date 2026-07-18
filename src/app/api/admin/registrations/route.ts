import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Đã gỡ bỏ toàn bộ logic yêu cầu đăng nhập (session) cho mạng nội bộ

    // Lấy toàn bộ danh sách đăng ký
    const registrations = await prisma.registration.findMany({
      include: {
        user: { 
            select: { name: true, email: true } 
        },
        event: { 
            select: { title: true } 
        },
        // Bổ sung lấy dữ liệu activities để render Lịch sử chạy trong Modal
        activities: {
            orderBy: {
                runDate: 'desc' // Hoạt động mới nhất lên đầu
            }
        }
      },
      orderBy: {
        id: 'desc' // Đơn đăng ký mới nhất lên đầu
      }
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Lỗi lấy danh sách đăng ký:", error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}