import { NextResponse } from "next/server";
import { Resend } from "resend";

import { auth } from "@/auth"; 

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // 1. Get Session (NextAuth v5)
    // No need for authOptions or getServerSession anymore.
    const session = await auth(); 
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subject, message } = body;

    // 2. Validation
    if (!subject || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 3. Send Email via Resend
    const data = await resend.emails.send({
      from: 'Docent AI Support <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL as string, 
      replyTo: session.user.email,
      subject: `[Support Ticket] ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Support Request</h2>
          <p><strong>User:</strong> ${session.user.name}</p>
          <p><strong>Email:</strong> ${session.user.email}</p>
          <hr />
          <h3>${subject}</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    if (data.error) {
        console.error("Resend API Error:", data.error);
        return NextResponse.json({ error: data.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.data?.id });

  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}