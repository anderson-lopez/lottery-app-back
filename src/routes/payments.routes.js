import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import client from '../utils/paypalClient.js';

const router = express.Router();

router.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: amount
      }
    }]
  });

  try {
    const order = await client.execute(request);
    res.status(200).json({ id: order.result.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al crear orden PayPal' });
  }
});

export default router;
