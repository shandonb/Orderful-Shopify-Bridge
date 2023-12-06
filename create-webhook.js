const axios = require('axios');

/* This module is purely for initializing the Shopify webhook. If you're doing that from some other location, it is safe to ignore */

// Fetching relevant details from environment variables
const SHOPIFY_URL= process.env.SHOPIFY_URL;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const APP_URL = process.env.APP_URL;

// Set up the endpoint and headers
const endpoint = `https://${SHOPIFY_URL}/admin/api/2023-04/webhooks.json`;
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': ACCESS_TOKEN,
};

// Webhook data
const webhookData = {
  webhook: {
    topic: 'orders/create',
    address: APP_URL,
    format: 'json',
  },
};

// Make the POST request to create the webhook
axios.post(endpoint, webhookData, { headers: headers })
  .then(response => {
    console.log('Webhook created:', response.data);
  })
  .catch(error => {
    console.error('Error creating webhook:', error.response.data);
  });
