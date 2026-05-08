import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { emailTemplates } from './email.templates.js';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.EMAIL_HOST || !env.EMAIL_USER) {
    logger.warn('SMTP not configured — email sends will be skipped.');
    transporter = null;
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
  });
  return transporter;
};

export const sendEmail = async (to, templateName, ...args) => {
  const tx = getTransporter();
  if (!tx) return { skipped: true };

  const tmpl = emailTemplates[templateName];
  if (!tmpl) {
    logger.error(`Email template '${templateName}' not found`);
    throw new Error(`Email template '${templateName}' not found`);
  }

  const { subject, html } = tmpl(...args);
  const info = await tx.sendMail({
    from: env.EMAIL_FROM || env.EMAIL_USER,
    to,
    subject,
    html,
  });
  logger.info(`Email sent to ${to}: ${info.messageId}`);
  return info;
};
