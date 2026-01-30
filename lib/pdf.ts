import { google } from "googleapis";

// Template Google Slides ID - you'll need to set this after uploading the template
const TEMPLATE_SLIDE_ID = process.env.GOOGLE_SLIDES_TEMPLATE_ID || "";

async function getAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return oauth2Client;
}

export async function generateCertificatePDF(
  studentName: string,
  courseName: string,
  courseDates: string
): Promise<Buffer> {
  const auth = await getAuthClient();
  const drive = google.drive({ version: "v3", auth });
  const slides = google.slides({ version: "v1", auth });

  // Step 1: Copy the template to create a new presentation
  const copyResponse = await drive.files.copy({
    fileId: TEMPLATE_SLIDE_ID,
    requestBody: {
      name: `Certificate - ${studentName}`,
    },
  });

  const newPresentationId = copyResponse.data.id!;

  try {
    // Step 2: Replace placeholders in the copied presentation
    await slides.presentations.batchUpdate({
      presentationId: newPresentationId,
      requestBody: {
        requests: [
          {
            replaceAllText: {
              containsText: {
                text: "[Student Name]",
                matchCase: false,
              },
              replaceText: studentName,
            },
          },
          {
            replaceAllText: {
              containsText: {
                text: "[Course Name]",
                matchCase: false,
              },
              replaceText: courseName,
            },
          },
          {
            replaceAllText: {
              containsText: {
                text: "[Course Dates]",
                matchCase: false,
              },
              replaceText: courseDates,
            },
          },
        ],
      },
    });

    // Step 3: Export as PDF
    const pdfResponse = await drive.files.export(
      {
        fileId: newPresentationId,
        mimeType: "application/pdf",
      },
      { responseType: "arraybuffer" }
    );

    // Step 4: Delete the temporary presentation
    await drive.files.delete({
      fileId: newPresentationId,
    });

    return Buffer.from(pdfResponse.data as ArrayBuffer);
  } catch (error) {
    // Clean up on error
    try {
      await drive.files.delete({
        fileId: newPresentationId,
      });
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

export function generateFileName(studentName: string): string {
  const sanitizedName = studentName
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-");
  return `${sanitizedName}-Certificate-of-Achievement.pdf`;
}
