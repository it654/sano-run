import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';



export async function GET(
  request: Request,
  // 1. Sửa kiểu dữ liệu của params thành Promise
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 2. Bắt buộc phải await params trước khi lấy id
    const resolvedParams = await params; 
    const eventId = resolvedParams.id;

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
        totalDistance: 'desc'
      }
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Lỗi khi lấy Bảng xếp hạng:", error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}