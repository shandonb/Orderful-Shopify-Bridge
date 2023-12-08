#!/usr/bin/env node

const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const retrieveOrder = require('./app_modules/retrieve-order');
const categorizeResponse = require('./app_modules/cat-res.js');

const app = express();
const SHARED_SECRET = process.env.SECRET_KEY;

// Middleware to capture raw body
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Function to verify Shopify HMAC
function verifyShopifyHmac(headers, rawBody) {
  const providedHmac = headers['x-shopify-hmac-sha256'];
  const generatedHash = crypto
    .createHmac('sha256', SHARED_SECRET)
    .update(rawBody)
    .digest('base64');
  
  return crypto.timingSafeEqual(Buffer.from(providedHmac, 'base64'), Buffer.from(generatedHash, 'base64'));
}

// Shopify Webhook endpoint
app.post('/webhook/orders/create', async (req, res) => {
  const isValid = verifyShopifyHmac(req.headers, req.rawBody);
  const orderData = JSON.parse(req.rawBody);

  if (!isValid) {
    console.error('Error verifying HMAC authenticity');
    return res.status(401).send('HMAC validation failed');
  }

  try {
    await retrieveOrder(orderData);
  } catch (error) {
    console.error('Error procesing order: ', error);
    return res.status(500).send('Internal server error');
  }

  res.status(200).send('Webhook processed');
});

// Orderful Webhook endpoint
app.post('/webhook/orderful' ,async (req, res) => {
  const orderfulResponse = req.body;

  try {
    await categorizeResponse(orderfulResponse);
    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Error categorizing Orderful response: ', error);
    res.status(500).send('Error processing webhook')
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});