import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all pages/bots
export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

// POST create new page/bot
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { pageId, pageName, accessToken, systemPrompt, isEnabled } = body

    const page = await prisma.page.create({
      data: {
        pageId,
        pageName,
        accessToken,
        systemPrompt,
        isEnabled: isEnabled ?? true
      }
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}
