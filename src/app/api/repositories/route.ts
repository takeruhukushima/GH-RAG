import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const repositories = await prisma.repository.findMany({
      orderBy: {
        lastIndexed: 'desc',
      },
      select: {
        id: true,
        name: true,
        owner: true,
        license: true,
        lastIndexed: true,
      },
    });

    return NextResponse.json(repositories);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
