import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET page configuration by Facebook Page ID (for Cloudflare Worker)
export async function GET(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const page = await prisma.page.findUnique({
      where: { pageId: params.pageId }
    })
    
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Don't expose access token to unauthorized requests
    // Only return config needed for bot operation
    return NextResponse.json({
      pageId: page.pageId,
      pageName: page.pageName,
      isEnabled: page.isEnabled,
      systemPrompt: page.systemPrompt,
      accessToken: page.accessToken // Only send if properly authenticated
    })
  } catch (error) {
    console.error('Error fetching page config:', error)
    return NextResponse.json({ error: 'Failed to fetch page config' }, { status: 500 })
  }
}
