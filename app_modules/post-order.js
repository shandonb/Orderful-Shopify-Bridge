const sdk = require('api')('@orderful/v3.0#1k349p1mlp3cue8b');
const convertToX12 = require('./convert-order.js');

sdk.auth(process.env.ORDERFUL_KEY);

async function postToOrderful(order, vendor) {
    try {
        const data = await convertToX12(order, vendor);
        const response = await sdk.transactionControllerV3_create(data);
        console.log('Orderful response:', response.data);
    } catch (error) {
        console.error('Error posting to Orderful:', error);
    }
}

module.exports = postToOrderful;