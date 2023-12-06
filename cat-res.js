const matchOrder = require('./post-fulfillment.js');
const postInventory = require('./post-inventory.js');

// This module looks at incoming data, and sorts it to the correct document flow based on document type

async function categorizeResponse(orderfulResponse) {
    console.log('Reading response');
    try{
        if (orderfulResponse.type.name === '856_SHIP_NOTICE_MANIFEST') {
            console.log('Received 856. Sending tracking information to Shopify');
            const vendor = orderfulResponse.sender.isaId;
            await matchOrder(orderfulResponse, vendor);
        } else if (orderfulResponse.type.name === '846_INVENTORY_INQUIRY_ADVICE') {
            console.log('Received 846. Posting inventory to Shopify');
            await postInventory(orderfulResponse);
        } else {
            // If a vendor sends a document type other than 846 or 856, we log it to the console to see what they sent
            console.log('Unknown document type: ', orderfulResponse.type.name);
        }
    } catch (error) {
        console.error('Error categorizing order: ', error);
        throw error;
    }
}

module.exports = categorizeResponse;