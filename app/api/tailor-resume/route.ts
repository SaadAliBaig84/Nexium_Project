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

    // --- Start of Delimiter Extraction Logic ---
    const startDelimiter = "---START_TAILORED_RESUME---";
    const endDelimiter = "---END_TAILORED_RESUME---";

    let rawTailoredResume: string;

    // Assuming n8n returns the LLM's full output in data[0].text
    if (
      Array.isArray(data) &&
      data.length > 0 &&
      typeof data[0].text === "string"
    ) {
      rawTailoredResume = data[0].text;
    } else if (typeof data === "string") {
      // Fallback if n8n directly returns the string
      rawTailoredResume = data;
    } else {
      // Handle cases where data is not as expected, perhaps it's an object with a different key
      console.warn("Unexpected data structure from n8n:", data);
      rawTailoredResume = JSON.stringify(data); // Convert to string to avoid errors in indexOf
    }

    let finalTailoredResume = "Error: Could not extract resume content."; // Default error message if extraction fails

    const startIndex = rawTailoredResume.indexOf(startDelimiter);
    const endIndex = rawTailoredResume.indexOf(endDelimiter);

    // Check if both delimiters are found and in the correct order
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      // Extract the content between the delimiters and trim any surrounding whitespace
      finalTailoredResume = rawTailoredResume
        .substring(
          startIndex + startDelimiter.length, // Start *after* the opening delimiter
          endIndex // End *before* the closing delimiter
        )
        .trim(); // Remove any leading/trailing whitespace, including newlines
    } else {
      // Fallback: If delimiters aren't found, log a warning and return the trimmed raw content
      console.warn(
        "Delimiters not found in LLM output from n8n. Returning trimmed raw content."
      );
      finalTailoredResume = rawTailoredResume.trim();
    }
    // --- End of Delimiter Extraction Logic ---

    // Return the extracted and cleaned resume
    return NextResponse.json({ tailoredResume: finalTailoredResume });
  } catch (err) {
    console.error("Tailor Resume API Error:", err);
    return NextResponse.json(
      { error: "Failed to tailor resume" },
      { status: 500 }
    );
  }
}
