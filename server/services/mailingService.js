import nodemailer from "nodemailer";
import config from "../config/config.js";

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.nodemailer.user,
    pass: config.nodemailer.pass,
  },
});

/**
 * Get message from contact and send to service mail
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Please provide all required fields: name, email, message.",
    });
  }

  try {
    const mailOptions = {
      from: email,
      to: `${config.nodemailer.user}`,
      subject: `Contact Form Submission from ${name}`,
      text: `You have a new contact form submission:\n\nName: ${name}\nEmail: ${email}\n\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      error: "There was an error sending your message. Please try again later.",
    });
  }
};
