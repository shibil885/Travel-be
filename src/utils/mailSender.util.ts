import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export async function mailsenderFunc(
  to: string,
  subject: string,
  messageType: 'otp',
  data: any,
) {
  let htmlContent: string;

  if (messageType === 'otp') {
    htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 24px;">OTP Verification</h1>
        </div>
        <div style="padding: 30px; text-align: center;">
          <p style="font-size: 18px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #555;">Your One-Time Password (OTP) is:</p>
          <div style="margin: 20px 0;">
            <h2 style="color: #ff6600; font-size: 36px; margin: 0;">${data.otp}</h2>
          </div>
          <p style="font-size: 14px; color: #555;">Please use this OTP to verify your account. The OTP is valid for <strong>60 sec</strong>.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; color: #777;">
          <p style="margin: 0;">If you did not request this, please ignore this email.</p>
          <p style="margin: 0;">Thanks,<br>Yathrapogaam</p>
        </div>
      </div>
    </div>`;
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL,
    to: to,
    subject: subject,
    html: htmlContent,
  });

  console.log('Message sent: %s', info.messageId);
}
