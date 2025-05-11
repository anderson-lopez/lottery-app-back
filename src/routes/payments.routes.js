import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import client from '../utils/paypalClient.js';
import Purchase from '../models/purchase.model.js';

const router = express.Router();

// Crear una orden de PayPal
router.post('/create-order', async (req, res) => {
  const { amount, buyer, packageId, quantity, unitPrice, totalPrice } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    application_context: {
      return_url: 'https://voy-a-ganar.netlify.app/payment-success',
      cancel_url: 'https://voy-a-ganar.netlify.app/checkout',
      brand_name: 'voy-a-ganar',
      user_action: 'PAY_NOW'
    },
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: totalPrice.toFixed(2) || amount,
      }
    }]
  });

  try {
    const order = await client.execute(request);
    const orderId = order.result.id;

    // Guardar en DB con estado pendiente
    const newPurchase = new Purchase({
      buyer: {
        ...buyer,
        acceptedTerms: Boolean(buyer.acceptedTerms)
      },
      packageId,
      quantity,
      unitPrice,
      totalPrice,
      paymentMethod: 'paypal',
      paypal: {
        orderId,
        status: 'PENDING',
        amount: parseFloat(totalPrice),
        currency: 'USD'
      }
    });

    await newPurchase.save();

    const approveLink = order.result.links.find(link => link.rel === 'approve')?.href;

    res.status(200).json({
      id: orderId,
      approveUrl: approveLink
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al crear orden PayPal' });
  }
});

// Capturar orden de PayPal
router.post('/capture-order', async (req, res) => {
  const { orderId } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    const purchaseInfo = capture.result;

    const payer = purchaseInfo.payer;
    const purchaseUnit = purchaseInfo.purchase_units[0];
    const payment = purchaseUnit.payments.captures[0];

    const updatedPurchase = await Purchase.findOneAndUpdate(
      { 'paypal.orderId': orderId },
      {
        $set: {
          'paypal.payerId': payer.payer_id,
          'paypal.paymentId': payment.id,
          'paypal.status': payment.status,
          'paypal.amount': parseFloat(payment.amount.value),
          'paypal.currency': payment.amount.currency_code,
          'paypal.completedAt': payment.create_time
        }
      },
      { new: true }
    );

    res.status(200).json({ msg: 'Orden capturada y guardada con éxito', purchase: updatedPurchase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al capturar la orden' });
  }
});

export default router;
