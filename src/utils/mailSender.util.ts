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
  messageType: 'otp' | 'agencyRegistration' | 'generatLink',
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
  } else if (messageType === 'agencyRegistration') {
    htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Registration Successful</h2>
          <p>Dear ${data.agencyName},</p>
          <p>Thank you for registering with us! Your registration has been received and is currently under review.</p>
          <p>Please wait for the admin's approval. You will be notified via email once your account has been approved.</p>
          <p>If you have any questions, feel free to reach out.</p>
          <p>Thanks,<br>Your System Team</p>
        </div>`;
  } else if (messageType === 'generatLink') {
    htmlContent = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>

<body style="background-color: #f3f4f6; margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
    <!-- Header -->
    <div style="background: #3d52a0; color: #ffffff; text-align: center; padding: 20px;">
      <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Password Reset Request</h1>
    </div>

    <!-- Body -->
    <div style="padding: 20px;">
      <h2 style="font-size: 20px; color: #3d52a0; margin-bottom: 10px;">Hi ${data.username},</h2>
      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
        We received a request to reset your password. Click the button below to set a new password:
      </p>

      <!-- Button -->
      <div style="text-align: center; margin: 20px 0;">
        <a href=${data.url}
          style="display: inline-block; padding: 12px 25px; font-size: 16px; color: #ffffff; background: #3d52a0; border-radius: 4px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          Reset Password
        </a>
      </div>

      <p style="color: #4b5563; line-height: 1.6; margin-top: 20px;">
        If you did not request a password reset, please ignore this email or contact support if you have any concerns.
      </p>
      <p style="color: #4b5563; line-height: 1.6; margin-top: 10px;">This link will expire in 24 hours for your security.</p>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; color: #6b7280; text-align: center; padding: 20px;">
      <p style="margin: 0; font-size: 14px;">&copy; 2024 [Your Company Name]. All rights reserved.</p>
      <p style="margin: 10px 0 0;"><a href="[SUPPORT_LINK]" style="color: #3d52a0; text-decoration: none;">Contact Support</a></p>
    </div>
  </div>
</body>

</html>

    `;
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL,
    to: to,
    subject: subject,
    html: htmlContent,
  });
  console.log('Message sent: %s', info.messageId);
  if (info) {
    return true;
  }
}
