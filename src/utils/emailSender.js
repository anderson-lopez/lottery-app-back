import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendPurchaseEmail(purchase, prizes) {
  const { buyer, assignedNumbers, paymentMethod, totalPrice, quantity, _id } = purchase;

  const fullName = `${buyer.firstName} ${buyer.lastName}`;
  const luckyNumbers = prizes.map(p => p.number);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Confirmación de compra</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 0; margin: 0; font-size: 16px;">
        <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #000; text-align: center; padding: 20px;">
            <h1 style="color: white; font-size: 28px; margin: 0;">Voy a Ganar</h1>
          </div>

          <div style="padding: 30px; text-align: center;">
            <h2 style="margin-top: 0;">Hola ${fullName}, ¡Gracias por tu compra!</h2>
            <p style="font-size: 20px; margin-bottom: 10px;">
              Orden <strong>#${_id.toString().slice(-6).toUpperCase()}</strong>
            </p>
          </div>

          <table style="width: 100%; padding: 0 30px;">
            <tr>
              <td>
                <p><strong>Números:</strong> Rifas</p>
                <p>Actividad #1<br />Cantidad: ${quantity}</p>
              </td>
              <td style="text-align: right;">
                <p style="font-size: 18px;"><strong>$${totalPrice}</strong></p>
              </td>
            </tr>
          </table>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 30px;" />

          <table style="width: 100%; padding: 0 30px;">
            <tr>
              <td>
                <p><strong>Método de pago</strong><br />
                  ${paymentMethod === 'card' ? 'Tarjeta de crédito/débito' : paymentMethod.toUpperCase()}
                </p>
              </td>
              <td style="text-align: right;">
                <p>Subtotal: $${totalPrice}<br /><strong>Total: $${totalPrice}</strong></p>
              </td>
            </tr>
          </table>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 30px;" />

          <div style="padding: 0 30px;">
            <h3 style="margin-bottom: 10px;">Datos Personales</h3>
            <table style="width: 100%; font-size: 16px;">
              <tr><td><strong>Nombre:</strong></td><td>${fullName}</td></tr>
              <tr><td><strong>Dirección:</strong></td><td>${buyer.address}</td></tr>
              <tr><td><strong>Ciudad:</strong></td><td>${buyer.city}</td></tr>
              <tr><td><strong>Teléfono:</strong></td><td>${buyer.phone}</td></tr>
              <tr><td><strong>Email:</strong></td><td>${buyer.email}</td></tr>
            </table>
          </div>

          <div style="padding: 30px;">
            <h3>Tus números son:</h3>
            <p style="font-family: monospace; font-size: 18px;">
              ${assignedNumbers.map(n => `${n}<br />`).join('')}
            </p>
          </div>

          <div style="padding: 0 30px;">
            <h4 style="font-size: 18px;">Más información:</h4>
            <p>¡Gracias por participar en nuestra actividad #1!</p>
            <p>Hay 10 números con premios en efectivo, revisa si tienes uno de estos:</p>
            <ul style="columns: 2; list-style-type: none; padding-left: 0;">
              ${luckyNumbers.map(n => `<li>- ${n}</li>`).join('')}
            </ul>
            <p>El premio mayor se revelará en una de nuestras redes sociales. ¡Síguenos para no perdértelo!</p>

            <p style="margin-top: 20px;">
              <strong>adrianfls_</strong><br />
              <a href="https://instagram.com/adrianfls_">https://instagram.com/adrianfls_</a><br /><br />
              <strong>alex47flores</strong><br />
              <a href="https://instagram.com/alex47flores">https://instagram.com/alex47flores</a>
            </p>
          </div>

          <div style="background-color: #000; color: white; text-align: center; padding: 20px; font-size: 14px;">
            <p>© ${new Date().getFullYear()} Voy a Ganar. Todos los derechos reservados.</p>
            <p><a href="https://yourdomain.com/terms" style="color: #aaa;">Términos y Condiciones</a></p>
          </div>
        </div>
      </body>
    </html>
    `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: buyer.email,
    subject: '🎟️ ¡Gracias por tu compra en Speed Rifas!',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
}