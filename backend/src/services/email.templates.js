import { env } from '../config/env.js';

const wrap = (inner) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    ${inner}
  </div>`;

export const emailTemplates = {
  welcomeEmail: (userName) => ({
    subject: 'Welcome to E-Study!',
    html: wrap(`
      <h1 style="color:#333;">Welcome to E-Study!</h1>
      <p>Hi ${userName},</p>
      <p>Thank you for joining E-Study. Browse courses, learn from experts, and earn certificates.</p>
      <p>Happy learning!<br/>The E-Study Team</p>
    `),
  }),

  purchaseConfirmation: (userName, courseName, amount, transactionId, paymentId) => ({
    subject: `Order Confirmation - ${courseName}`,
    html: wrap(`
      <h1 style="color:#333;">Purchase Confirmed!</h1>
      <p>Hi ${userName},</p>
      <p>Your enrollment is active. Here are your transaction details:</p>
      <div style="background:#f5f5f5;padding:20px;border-radius:8px;margin:20px 0;">
        <p><strong>Course:</strong> ${courseName}</p>
        <p><strong>Amount Paid:</strong> $${amount}</p>
        ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
      </div>
      <p>You now have lifetime access to this course.</p>
      <p>
        <a href="${env.FRONTEND_URL}/student" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;margin-right:8px;">View Your Courses</a>
        ${paymentId ? `<a href="${env.FRONTEND_URL}/dashboard/payments/${paymentId}" style="background:#10b981;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Download Receipt</a>` : ''}
      </p>
    `),
  }),

  moduleReleaseNotification: (userName, courseName, moduleName) => ({
    subject: `New Module Released - ${courseName}`,
    html: wrap(`
      <h1 style="color:#333;">New Module Released!</h1>
      <p>Hi ${userName},</p>
      <p>A new module is live in <strong>${courseName}</strong>:</p>
      <div style="background:#f5f5f5;padding:20px;border-radius:8px;margin:20px 0;">
        <h3 style="margin:0;">${moduleName}</h3>
      </div>
      <p><a href="${env.FRONTEND_URL}/student" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">View Course</a></p>
    `),
  }),

  instructorNotification: (instructorName, studentName, courseName) => ({
    subject: `New Student Enrollment - ${courseName}`,
    html: wrap(`
      <h1 style="color:#333;">New Enrollment</h1>
      <p>Hi ${instructorName},</p>
      <p><strong>${studentName}</strong> has enrolled in <strong>${courseName}</strong>.</p>
      <p><a href="${env.FRONTEND_URL}/instructor" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">View Dashboard</a></p>
    `),
  }),
};
