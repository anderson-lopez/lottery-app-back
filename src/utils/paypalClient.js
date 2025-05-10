import paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';
dotenv.config();

const env = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(env);

export default client;
// export const createOrder = async (amount) => {
//   const request = new paypal.orders.OrdersCreateRequest();
//   request.requestBody({
//     intent: 'CAPTURE',
//     purchase_units: [
//       {
//         amount: {
//           currency_code: 'USD',
//           value: amount,
//         },
//       },
//     ],
//   });

//   try {
//     const response = await client.execute(request);
//     return response.result.id;
//   } catch (error) {
//     console.error('Error creating PayPal order:', error);
//     throw error;
//   }
// };
// export const captureOrder = async (orderId) => {
//   const request = new paypal.orders.OrdersCaptureRequest(orderId);
//   request.requestBody({});

//   try {
//     const response = await client.execute(request);
//     return response.result;
//   } catch (error) {
//     console.error('Error capturing PayPal order:', error);
//     throw error;
//   }
// };