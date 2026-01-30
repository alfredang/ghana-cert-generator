import { google } from "googleapis";

interface EmailOptions {
  to: string;
  studentName: string;
  courseName: string;
  pdfBuffer: Buffer;
  fileName: string;
}

// CC recipients for all certificate emails
const CC_RECIPIENTS = [
  "iris@tertiaryinfotech.com",
  "angch@tertiaryinfotech.com",
  "siraj@tertiarycourses.com.gh",
];

function createEmailWithAttachment(
  to: string,
  cc: string[],
  subject: string,
  htmlBody: string,
  textBody: string,
  attachment: { filename: string; content: Buffer; mimeType: string }
): string {
  const boundary = "boundary_" + Date.now().toString(16);
  const fromEmail = process.env.EMAIL_USER;

  const emailLines = [
    `From: "Tertiary Courses" <${fromEmail}>`,
    `To: ${to}`,
    `Cc: ${cc.join(", ")}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: multipart/alternative; boundary=\"alt_boundary\"",
    "",
    "--alt_boundary",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    textBody,
    "",
    "--alt_boundary",
    "Content-Type: text/html; charset=UTF-8",
    "",
    htmlBody,
    "",
    "--alt_boundary--",
    "",
    `--${boundary}`,
    `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${attachment.filename}"`,
    "",
    attachment.content.toString("base64"),
    "",
    `--${boundary}--`,
  ];

  const email = emailLines.join("\r\n");

  // Encode to base64url format
  return Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendCertificateEmail({
  to,
  studentName,
  courseName,
  pdfBuffer,
  fileName,
}: EmailOptions): Promise<void> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const emailHTML = `
    <div style="font-family: Arial, sans-serif;">
      <p>Dear ${studentName},</p>

      <p>Congratulations on completing the ${courseName}! Your certificate is attached.</p>

      <p>We appreciate your participation and hope to see you in our future courses and learning opportunities.</p>

      <p>Thank you so much!</p>

      <p>Warmest Regards,</p>

      <p style="margin: 0; line-height: 1.5;">
        Administrator<br>
        <strong>Tertiary Infotech Academy Pte. Ltd.</strong><br>
        EdTech Solutions Provider for TMS & LMS<br>
        Course Development | Training | Agentic AI Automation<br>
        EdTech: <a href="https://www.tertiaryinfotech.com">www.tertiaryinfotech.com</a><br>
        PEI Courses: <a href="https://www.tertiaryinfotech.edu.sg">www.tertiaryinfotech.edu.sg</a><br>
        WSQ and IBF Courses: <a href="https://www.tertiarycourses.com.sg">www.tertiarycourses.com.sg</a><br>
        Agentic AI Automation: <a href="https://www.tertiaryrobotics.com">www.tertiaryrobotics.com</a>
      </p>

      <p style="margin: 10px 0 0 0; line-height: 1.5;">
        Address: 12 Woodlands Square #07-85/86/87 Woods Square Tower 1, Singapore 737715 <a href="https://g.page/tertiary-infotech-pte-ltd?share">Map</a><br>
        UEN: 201200696W | GST: 201200696W<br>
        PEI | WSQ ATO | IBF ATO | SAC ATO | Linux Foundation, Pearson Vue, Autodesk, Microsoft, AWS, CompTIA Training Partners | Pearson Vue, Kryterion and PSI Test Centers
      </p>
    </div>
  `;

  const emailText = `Dear ${studentName},

Congratulations on completing the ${courseName}! Your certificate is attached.

We appreciate your participation and hope to see you in our future courses and learning opportunities.

Thank you so much!

Warmest Regards,

Administrator
Tertiary Infotech Academy Pte. Ltd.
EdTech Solutions Provider for TMS & LMS
Course Development | Training | Agentic AI Automation

EdTech: www.tertiaryinfotech.com
PEI Courses: www.tertiaryinfotech.edu.sg
WSQ and IBF Courses: www.tertiarycourses.com.sg
Agentic AI Automation: www.tertiaryrobotics.com

Address: 12 Woodlands Square #07-85/86/87 Woods Square Tower 1, Singapore 737715
Map: https://g.page/tertiary-infotech-pte-ltd?share

UEN: 201200696W | GST: 201200696W
PEI | WSQ ATO | IBF ATO | SAC ATO | Linux Foundation, Pearson Vue, Autodesk, Microsoft, AWS, CompTIA Training Partners | Pearson Vue, Kryterion and PSI Test Centers`;

  const rawEmail = createEmailWithAttachment(
    to,
    CC_RECIPIENTS,
    "Certificate of Achievement: Congratulations!",
    emailHTML,
    emailText,
    {
      filename: fileName,
      content: pdfBuffer,
      mimeType: "application/pdf",
    }
  );

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: rawEmail,
    },
  });

  console.log("Email sent successfully via Gmail API:", result.data.id);
}
