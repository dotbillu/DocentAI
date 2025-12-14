import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // SIMULATION: In a real app, you would upload to S3 or write to disk here.
    // We will just return the file details to mimic a successful upload.
    
    // Simulate network delay (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log(`[Mock Server] Received file: ${file.name} (${file.size} bytes)`);

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}