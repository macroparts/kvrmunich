import * as nodemailer from "nodemailer";

export function sendmail(subject: string, message: string): void {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const mail = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    subject: subject,
    text: message
  };

  transport.sendMail(mail);
}
