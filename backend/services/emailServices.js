import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
const emailTemplates = {
  welcomeEmail: (userName, email) => ({
    subject: 'Welcome to EDUCART!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to EDUCART!</h1>
        <p>Hi ${userName},</p>
        <p>Thank you for joining EDUCART, the advanced learning management system.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse and enroll in thousands of courses</li>
          <li>Learn from industry experts</li>
          <li>Get certificates for course completion</li>
        </ul>
        <p style="margin-top: 30px;">Happy learning!<br/>
        The EDUCART Team</p>
      </div>
    `,
  }),

  purchaseConfirmation: (userName, courseName, amount) => ({
    subject: `Order Confirmation - ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Purchase Confirmed!</h1>
        <p>Hi ${userName},</p>
        <p>Thank you for your purchase!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Amount Paid:</strong> $${amount}</p>
        </div>
        <p>You now have lifetime access to this course. Start learning anytime!</p>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/student" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Your Courses
          </a>
        </p>
        <p style="margin-top: 30px;">Best regards,<br/>
        The EDUCART Team</p>
      </div>
    `,
  }),

  moduleReleaseNotification: (userName, courseName, moduleName) => ({
    subject: `New Module Released - ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Module Released!</h1>
        <p>Hi ${userName},</p>
        <p>A new module has been released in <strong>${courseName}</strong>!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${moduleName}</h3>
          <p>Start learning now and complete this module to progress in the course.</p>
        </div>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/student" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Course
          </a>
        </p>
        <p style="margin-top: 30px;">Happy learning!<br/>
        The EDUCART Team</p>
      </div>
    `,
  }),

  instructorNotification: (instructorName, studentName, courseName) => ({
    subject: `New Student Enrollment - ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Student Enrollment!</h1>
        <p>Hi ${instructorName},</p>
        <p><strong>${studentName}</strong> has just enrolled in your course <strong>${courseName}</strong>!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Check your instructor dashboard to see student progress and provide support.</p>
        </div>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/instructor" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Dashboard
          </a>
        </p>
        <p style="margin-top: 30px;">Best regards,<br/>
        The EDUCART Team</p>
      </div>
    `,
  }),
};

// Send email function
export const sendEmail = async (to, templateName, ...args) => {
  try {
    if (!emailTemplates[templateName]) {
      console.error(`Email template ${templateName} not found`);
      return;
    }

    const { subject, html } = emailTemplates[templateName](...args);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default { sendEmail, emailTemplates };
