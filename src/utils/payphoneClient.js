import axios from 'axios';

const clientId = process.env.PAYPHONE_CLIENT_ID;
const clientSecret = process.env.PAYPHONE_CLIENT_SECRET;
const encodingPassword = process.env.PAYPHONE_ENCODING_PASSWORD;

let cachedToken = null;

export async function getAccessToken() {
  if (cachedToken) return cachedToken;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post(
    'https://backoffice.payphone.com/api/v1/security/token',
    {},
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    }
  );

  cachedToken = response.data.accessToken;
  return cachedToken;
}

export async function createPayPhoneOrder({ amount, buyer }) {
  const token = await getAccessToken();

  const payload = {
    amount: Math.round(amount * 100), // en centavos
    amountWithoutTax: 0,
    tax: Math.round(amount * 100), // opcional
    clientTransactionId: Math.random().toString(36).substring(2, 12),
    phoneNumber: buyer.phone,
    countryCode: '593', // el de Ecuador (no funciona con números colombianos)
    email: buyer.email,
    responseUrl: 'https://voy-a-ganar.netlify.app/payment-success',
    cancellationUrl: 'https://voy-a-ganar.netlify.app/checkout'
  };

  const response = await axios.post(
    'https://backoffice.payphone.com/api/v2/transactions',
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Encoding': encodingPassword
      }
    }
  );

  const { transactionId, payWithPayPhoneUrl } = response.data;

  return {
    transactionId,
    paymentUrl: payWithPayPhoneUrl
  };
}
