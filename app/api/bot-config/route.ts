import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all enabled bot configurations for Cloudflare Worker
// This endpoint returns only essential data needed by the worker
export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      where: { isEnabled: true },
      select: {
        pageId: true,
        pageName: true,
        accessToken: true,
        systemPrompt: true,
        isEnabled: true,
      },
    });

    // Transform to the format expected by Cloudflare Worker
    const configs: Record<string, any> = {};

    for (const page of pages) {
      configs[page.pageId] = {
        name: page.pageName,
        accessToken: page.accessToken,
        isEnabled: page.isEnabled,
        systemPrompt: page.systemPrompt,
      };
    }

    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching bot configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch bot configs" },
      { status: 500 },
    );
  }
}

// GET specific page config by pageId (query parameter)
export async function POST(request: Request) {
  try {
    const { pageId } = await request.json();

    const page = await prisma.page.findUnique({
      where: { pageId },
      select: {
        pageId: true,
        pageName: true,
        accessToken: true,
        systemPrompt: true,
        isEnabled: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: page.pageName,
      accessToken: page.accessToken,
      isEnabled: page.isEnabled,
      systemPrompt: page.systemPrompt,
    });
  } catch (error) {
    console.error("Error fetching page config:", error);
    return NextResponse.json(
      { error: "Failed to fetch page config" },
      { status: 500 },
    );
  }
}
