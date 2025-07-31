import { NextResponse } from "next/server";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!; // store in .env

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    console.log("here");
    // Send to n8n workflow
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatInputmessage: { resumeText, jobDescription },
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ tailoredResume: data[0].text || data });
  } catch (err) {
    console.error("Tailor Resume API Error:", err);
    return NextResponse.json(
      { error: "Failed to tailor resume" },
      { status: 500 }
    );
  }
}
