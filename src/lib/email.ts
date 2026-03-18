import nodemailer from "nodemailer";
import { QuizLink } from "./quiz";
import { WeatherData, formatWeatherHtml } from "./weather";

export interface DigestContent {
  newsSummary: string;
  weather: WeatherData | null;
  quiz: QuizLink | null;
  articleCount: number;
}

function getSmtpConfig() {
  const user = process.env.EMAIL_USER || "";
  const pass = process.env.EMAIL_PASS || "";
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

export async function sendDigestEmail(content: DigestContent): Promise<void> {
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

  // Bygg innholdsseksjoner
  const weatherSection = content.weather
    ? formatWeatherHtml(content.weather)
    : "";

  const newsSection = `
    <div style="margin-bottom:20px">
      <h2 style="font-size:18px;margin:0 0 12px 0">📰 Dagens ${content.articleCount > 0 ? Math.min(content.articleCount, 5) : 0} viktigste saker</h2>
      ${content.newsSummary}
    </div>`;

  const quizSection = content.quiz
    ? `
    <div style="background:#f9f5ff;border-radius:8px;padding:16px;margin-bottom:20px">
      <h2 style="margin:0 0 8px 0;font-size:18px">🧠 Dagens Quiz</h2>
      <p style="margin:0">
        <a href="${content.quiz.url}" style="color:#6b21a8;text-decoration:none;font-weight:600">
          ${content.quiz.title} →
        </a>
      </p>
    </div>`
    : "";

  const emailHtml = `
<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      color: #1a1a1a;
      background-color: #fafafa;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px solid #1a1a1a;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      letter-spacing: -0.5px;
    }
    .header .date {
      color: #666;
      font-size: 14px;
      margin-top: 4px;
    }
    h2 { color: #1a1a1a; }
    p { margin: 10px 0; }
    ol { padding-left: 20px; }
    li { margin: 10px 0; }
    strong { color: #0a0a0a; }
    a { color: #1a0dab; }
    .footer {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Morgennytt</h1>
    <div class="date">${today}</div>
  </div>
  ${weatherSection}
  ${newsSection}
  ${quizSection}
  <div class="footer">
    <p>Automatisk generert av Morgennytt · Kilder: VG, Aftenposten, NRK, NYTimes · Vær: Yr.no</p>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Morgennytt" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject: `Morgennytt — ${today}`,
    html: emailHtml,
  });
}
