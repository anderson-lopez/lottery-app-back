import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendPurchaseEmail(purchase) {
  const { buyer, assignedNumbers, paymentMethod } = purchase;

  const htmlContent = `
    <h2>¡Gracias por tu compra, ${buyer.firstName}!</h2>
    <p>Has adquirido ${assignedNumbers.length} números para la rifa.</p>
    <p><strong>Números asignados:</strong> ${assignedNumbers.join(', ')}</p>
    <p>Método de pago: ${paymentMethod}</p>
    <p>¡Buena suerte! 🍀</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: buyer.email,
    subject: '¡Tus números de rifa están aquí!',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
}
