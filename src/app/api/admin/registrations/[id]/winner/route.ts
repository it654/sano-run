import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
 

    const resolvedParams = await params;
    
    // Nhận dữ liệu thứ hạng (dạng số)
    const { isWinner } = await request.json();

    const updated = await prisma.registration.update({
      where: { id: resolvedParams.id },
      data: { isWinner: Number(isWinner) }, // Ép kiểu an toàn thành Number
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi cập nhật giải thưởng' }, { status: 500 });
  }
}