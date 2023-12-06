const filterOrders = require('./filter-orders.js');

async function retrieveOrder(orderData) {
    console.log('Processing Order: ', orderData.id);
    try {
        await filterOrders(orderData);

    } catch(error) {
        console.error('Error processing order: ', error);
        throw error;
    }
}

module.exports = retrieveOrder;