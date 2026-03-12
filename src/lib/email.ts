import nodemailer from "nodemailer";

function getSmtpConfig() {
  const user = process.env.EMAIL_USER || "";
  const pass = process.env.EMAIL_PASS || "";

  // Auto-detect SMTP host based on email domain
  const domain = user.split("@")[1]?.toLowerCase() || "";

  const smtpMap: Record<string, { host: string; port: number }> = {
    "gmail.com": { host: "smtp.gmail.com", port: 587 },
    "googlemail.com": { host: "smtp.gmail.com", port: 587 },
    "outlook.com": { host: "smtp-mail.outlook.com", port: 587 },
    "hotmail.com": { host: "smtp-mail.outlook.com", port: 587 },
    "live.com": { host: "smtp-mail.outlook.com", port: 587 },
    "yahoo.com": { host: "smtp.mail.yahoo.com", port: 587 },
    "icloud.com": { host: "smtp.mail.me.com", port: 587 },
  };

  const smtp = smtpMap[domain] || { host: "smtp.gmail.com", port: 587 };

  return {
    host: smtp.host,
    port: smtp.port,
    secure: false,
    auth: { user, pass },
  };
}

export async function sendDigestEmail(
  htmlContent: string,
  articleCount: number
): Promise<void> {
  const recipient = process.env.DIGEST_RECIPIENT_EMAIL;
  if (!recipient) {
    throw new Error("DIGEST_RECIPIENT_EMAIL er ikke satt");
  }

  const transporter = nodemailer.createTransport(getSmtpConfig());

  const today = new Date().toLocaleDateString("nb-NO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const emailHtml = `
<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Georgia, 'Times New Roman', serif;
      max-width: 640px;
      margin: 0 auto;
      padding: 20px;
      color: #1a1a1a;
      background-color: #fafafa;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px solid #1a1a1a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      letter-spacing: -0.5px;
    }
    .header .date {
      color: #666;
      font-size: 14px;
      margin-top: 4px;
    }
    h2 {
      color: #1a1a1a;
      font-size: 20px;
      margin-top: 28px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 6px;
    }
    p { margin: 12px 0; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
    strong { color: #0a0a0a; }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Morgennytt</h1>
    <div class="date">${today} &middot; ${articleCount} artikler oppsummert</div>
  </div>
  ${htmlContent}
  <div class="footer">
    <p>Denne oppsummeringen er automatisk generert av Morgennytt med Claude AI.</p>
    <p>Kilder: VG, Aftenposten, NRK, The New York Times</p>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Morgennytt" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject: `Morgennytt - ${today}`,
    html: emailHtml,
  });
}
