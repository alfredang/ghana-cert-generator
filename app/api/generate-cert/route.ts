import { NextRequest, NextResponse } from "next/server";
import { generateCertificatePDF, generateFileName } from "@/lib/pdf";
import { sendCertificateEmail } from "@/lib/email";

interface RequestBody {
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseDates: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { studentName, studentEmail, courseName, courseDates } = body;

    // Validate required fields
    if (!studentName || !studentEmail || !courseName || !courseDates) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(studentEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Generate PDF certificate
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateCertificatePDF(
        studentName,
        courseName,
        courseDates
      );
      console.log("PDF generated successfully, size:", pdfBuffer.length);
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      return NextResponse.json(
        { error: `PDF generation failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    const fileName = generateFileName(studentName);

    // Send email with certificate
    try {
      await sendCertificateEmail({
        to: studentEmail,
        studentName,
        courseName,
        pdfBuffer,
        fileName,
      });
      console.log("Email sent successfully to:", studentEmail);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json(
        { error: `Email sending failed: ${emailError instanceof Error ? emailError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Certificate sent successfully to ${studentEmail}`,
      fileName,
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
