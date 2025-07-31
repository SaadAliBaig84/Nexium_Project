import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { message: "No PDF file uploaded or invalid file type." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Node.js Buffer

    // Use pdf-parse to extract text
    const data = await pdf(buffer);

    return NextResponse.json({ text: data.text }, { status: 200 });
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return NextResponse.json(
      {
        message: "Failed to extract text from PDF.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
