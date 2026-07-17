import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';



export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    // Lấy danh sách đăng ký của giải này, gộp thông tin User và sắp xếp theo số KM
    const leaderboard = await prisma.registration.findMany({
      where: { eventId: eventId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        totalDistance: 'desc' // Sắp xếp giảm dần (Nhiều km nhất đứng đầu)
      }
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Lỗi khi lấy Bảng xếp hạng:", error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}