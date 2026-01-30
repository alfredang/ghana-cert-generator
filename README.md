# Certificate Generator

A web application that automatically generates course completion certificates and sends them via email. Built for Tertiary Infotech Academy Pte Ltd.

## Features

- **Form-based Input**: Collect student name, email, course name, and course dates
- **Google Slides Integration**: Uses a Google Slides template for professional certificate design
- **Automatic PDF Generation**: Converts the certificate to PDF with placeholder replacement
- **Email Delivery**: Sends certificates via Gmail API with OAuth2 authentication
- **CC Recipients**: Automatically copies admin team on all certificate emails
- **Professional Email Template**: Includes company signature and branding

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Inline Styles
- **Form Handling**: React Hook Form
- **APIs**:
  - Google Slides API (template management)
  - Google Drive API (file operations)
  - Gmail API (email delivery)
- **Authentication**: Google OAuth2
- **Deployment**: Vercel

## How It Works

1. User fills out the certificate form (student name, email, course name, dates)
2. App copies the Google Slides template
3. Placeholders (`[Student Name]`, `[Course Name]`, `[Course Dates]`) are replaced
4. Slide is exported as PDF
5. Email is sent with PDF attachment via Gmail API
6. Temporary slide copy is deleted

## Environment Variables

Create a `.env.local` file with:

```env
EMAIL_USER=your-email@domain.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_SLIDES_TEMPLATE_ID=your-slides-template-id
```

### Getting Google OAuth2 Credentials

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Gmail API, Google Drive API, and Google Slides API
3. Create OAuth 2.0 credentials (Web application)
4. Add `https://developers.google.com/oauthplayground` to authorized redirect URIs
5. Use [OAuth Playground](https://developers.google.com/oauthplayground) to get refresh token with scopes:
   - `https://mail.google.com/`
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/presentations`

### Setting Up the Certificate Template

1. Create a Google Slides presentation with your certificate design
2. Add placeholders: `[Student Name]`, `[Course Name]`, `[Course Dates]`
3. Copy the Slide ID from the URL
4. Set `GOOGLE_SLIDES_TEMPLATE_ID` in your environment

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

Deploy to Vercel and add all environment variables in the project settings.

## License

Proprietary - Tertiary Infotech Academy Pte Ltd
