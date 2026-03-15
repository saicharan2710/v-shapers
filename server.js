require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('V Shapers backend is running.');
});

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

app.post('/book-demo', async (req, res) => {
  const { name, phone, email, date } = req.body;

  if (!name || !phone || !email || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send confirmation email
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Your V Shapers Demo is Booked',
      text: `Hi ${name},\n\nThank you for booking a free demo at V Shapers on ${date}.\n\nYou can visit the gym anytime during our working hours.\n\nSee you soon!`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to send confirmation.' });
  }
});

app.post('/register-membership', async (req, res) => {
  const { name, phone, email, age, startDate, plan, paymentMethod } = req.body;

  if (!name || !phone || !email || !age || !startDate || !plan || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required membership fields' });
  }

  try {
    const membershipId = `VS-${Date.now()}`;

    const transporter = createTransporter();

    const isPayAtGym = paymentMethod.toLowerCase().includes('gym');

    const subject = isPayAtGym
      ? 'V Shapers Registration Received — Payment Pending'
      : 'V Shapers Membership Confirmed';

    const text = isPayAtGym
      ? `Hi ${name},\n\nThank you for registering for the ${plan}. Your registration is almost complete — please visit the gym and complete payment to confirm your membership.\n\nMembership ID: ${membershipId}\n\nOnce payment is complete, your membership will become active.\n\nSee you soon!`
      : `Hi ${name},\n\nYour payment has been successfully received and your membership is now active for the ${plan}.\n\nMembership ID: ${membershipId}\n\nWelcome to V Shapers!\n`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, membershipId });
  } catch (error) {
    console.error('Membership registration error:', error);
    res.status(500).json({ error: 'Failed to send membership confirmation.' });
  }
});

app.listen(port, () => {
  console.log(`V Shapers backend listening on http://localhost:${port}`);
});