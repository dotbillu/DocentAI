import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; 
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    // 1. Security: Check if user is authenticated
    // Note: In strict Next.js setups, you may need to pass your authOptions here: getServerSession(authOptions)
    const session = await getServerSession(); 
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subject, message } = body;

    // 2. Validation
    if (!subject || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 3. Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 4. Send the email
    await transporter.sendMail({
      from: `"Docent AI Support" <${process.env.GMAIL_USER}>`, 
      to: process.env.GMAIL_USER, 
      replyTo: session.user.email,
      subject: `[Support Ticket] ${subject}`,
      text: `
--------------------------------------------------
Support Request
--------------------------------------------------
User: ${session.user.name}
Email: ${session.user.email}

Subject: ${subject}

Message:
${message}
`,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Email sending failed:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}