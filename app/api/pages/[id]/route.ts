import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single page
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 },
    );
  }
}

// PATCH update page
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('🔄 Updating page:', id);
    console.log('📝 Update data:', body);

    // Validate that the page exists first
    const existingPage = await prisma.page.findUnique({
      where: { id },
    });

    if (!existingPage) {
      console.error('❌ Page not found:', id);
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // Update the page
    const page = await prisma.page.update({
      where: { id },
      data: body,
    });

    console.log('✅ Page updated successfully:', page.pageName);
    return NextResponse.json(page);
  } catch (error) {
    console.error("❌ Error updating page:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { 
        error: "Failed to update page",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 },
    );
  }
}

// DELETE page
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.page.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 },
    );
  }
}
