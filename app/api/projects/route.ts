import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { name, goal } = await req.json();

  if (!name || !goal) {
    return NextResponse.json({ message: 'Project name and goal are required' }, { status: 400 });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        goal,
        ownerId: session.user.id as string,
        members: {
          create: {
            userId: session.user.id as string,
          },
        },
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id as string,
          },
        },
      },
      include: {
        members: true,
      },
    });
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
