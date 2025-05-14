import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import client from '../utils/paypalClient.js';
import Purchase from '../models/purchase.model.js';
import RaffleNumber from '../models/raffleNumbers.model.js';
import { createPayPhoneOrder, getAccessToken } from '../utils/payphoneClient.js';
import stripe from '../utils/stripeClient.js';
import axios from 'axios';

const router = express.Router();

// Crear una orden de pago
router.post('/create-order', async (req, res) => {
  const { amount, buyer, packageId, quantity, unitPrice, totalPrice, paymentMethod } = req.body;

  try {
    let purchaseData = {
      buyer: {
        ...buyer,
        acceptedTerms: Boolean(buyer.acceptedTerms)
      },
      packageId,
      quantity,
      unitPrice,
      totalPrice,
      paymentMethod
    };

    let responsePayload = {};

    switch (paymentMethod) {
      case 'paypal': {
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
          intent: 'CAPTURE',
          application_context: {
            return_url: `${process.env.PRODUCT_FRONTEND_URL}/payment-success`,
            cancel_url: `${process.env.PRODUCT_FRONTEND_URL}/checkout`,
            brand_name: 'voy-a-ganar',
            user_action: 'PAY_NOW'
          },
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: totalPrice.toFixed(2) || amount
            }
          }]
        });

        const order = await client.execute(request);
        const orderId = order.result.id;
        const approveUrl = order.result.links.find(link => link.rel === 'approve')?.href;

        purchaseData.paypal = {
          orderId,
          status: 'PENDING',
          amount: parseFloat(totalPrice),
          currency: 'USD'
        };

        responsePayload = { id: orderId, approveUrl };
        break;
      }

      case 'payphone': {
        const payphoneData = await createPayPhoneOrder({
          amount: totalPrice,
          buyer
        });

        purchaseData.card = {
          transactionId: payphoneData.transactionId,
          status: 'PENDING'
        };

        responsePayload = {
          id: payphoneData.transactionId,
          payUrl: payphoneData.paymentUrl
        };
        break;
      }

      case 'card': {
        if (buyer?.paymentProvider !== 'stripe') {
          return res.status(400).json({ msg: 'Proveedor de tarjeta no soportado' });
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Compra de paquete de rifas',
                description: `Paquete ID: ${packageId}`
              },
              unit_amount: Math.round(Number(totalPrice.toFixed(2)) * 100)
            },
            quantity: 1
          }],
          mode: 'payment',
          success_url: `${process.env.PRODUCT_FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.PRODUCT_FRONTEND_URL}/checkout`,
          metadata: {
            buyerEmail: buyer.email,
            buyerName: `${buyer.firstName} ${buyer.lastName}`,
            packageId,
          }
        });

        purchaseData.card = {
          transactionId: session.id,
          status: 'PENDING',
          paymentProvider: 'stripe'
        };

        responsePayload = {
          id: session.id,
          checkoutUrl: session.url
        };

        break;
      }

      default:
        return res.status(400).json({ msg: 'Método de pago no soportado' });
    }

    // Guardar la compra en MongoDB
    const newPurchase = new Purchase(purchaseData);
    await newPurchase.save();

    // Asignar números aleatorios no repetidos
    const availableNumbers = await RaffleNumber.aggregate([
      { $match: { status: 'available' } },
      { $sample: { size: quantity } }
    ]);

    if (availableNumbers.length < quantity) {
      return res.status(400).json({ msg: 'No hay suficientes números disponibles para esta compra' });
    }

    const assignedNumbers = [];

    for (const number of availableNumbers) {
      await RaffleNumber.updateOne(
        { _id: number._id },
        { $set: { status: 'assigned', assignedTo: newPurchase._id } }
      );
      assignedNumbers.push(number.number);
    }

    newPurchase.assignedNumbers = assignedNumbers;
    await newPurchase.save();

    res.status(200).json(responsePayload);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al crear la orden' });
  }
});

// Verificar Stripe
router.post('/verify-stripe', async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent.charges']
    });

    const paymentIntent = session.payment_intent;

    if (paymentIntent.status === 'succeeded') {
      const charge = paymentIntent.charges?.data?.[0];

      const updatedPurchase = await Purchase.findOneAndUpdate(
        { 'card.transactionId': session.id },
        {
          $set: {
            'card.status': 'COMPLETED',
            'card.cardBrand': charge?.payment_method_details?.card?.brand || '',
            'card.last4': charge?.payment_method_details?.card?.last4 || '',
            'card.completedAt': new Date((paymentIntent.created || Date.now()) * 1000)
          }
        },
        { new: true }
      );

      return res.status(200).json({ msg: 'Pago exitoso', purchase: updatedPurchase });
    } else {
      return res.status(400).json({ msg: 'El pago aún no se ha completado', status: paymentIntent.status });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al verificar el pago con Stripe' });
  }
});

// Verificar Payphone
router.post('/verify-payphone', async (req, res) => {
  const { transactionId } = req.body;

  if (!transactionId) {
    return res.status(400).json({ msg: 'transactionId es requerido' });
  }

  try {
    const token = await getAccessToken();

    const response = await axios.get(`https://backoffice.payphone.com/api/v1/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;

    if (data.status === 'Approved') {
      const updatedPurchase = await Purchase.findOneAndUpdate(
        { 'card.transactionId': transactionId },
        {
          $set: {
            'card.status': 'COMPLETED',
            'card.paymentProvider': 'payphone',
            'card.cardBrand': data.cardBrand || 'unknown',
            'card.last4': data.cardNumber ? data.cardNumber.slice(-4) : '',
            'card.completedAt': new Date(data.transactionDate)
          }
        },
        { new: true }
      );

      return res.status(200).json({
        msg: 'Pago aprobado y guardado',
        purchase: updatedPurchase
      });
    } else {
      return res.status(400).json({ msg: 'La transacción no fue aprobada', status: data.status });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al verificar la transacción' });
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
