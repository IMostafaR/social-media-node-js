import nodemailer from "nodemailer";

/**
 * Send an email using the configured nodemailer transporter.
 *
 * @async
 * @param {Object} options - The email sending options.
 * @param {string} options.email - The recipient's email address.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.html - The HTML content of the email.
 * @throws {Error} Throws an error if there's an issue with sending the email.
 */

export const emailSender = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  /**
   * Information about the sent email.
   * @type {Object}
   */
  const info = await transporter.sendMail({
    from: `"E-Commerce App 📦" <${process.env.EMAIL_ADDRESS}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  });

  return info.rejected.length ? false : true;
};
