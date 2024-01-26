const axios = require('axios');
const { getVendorByIsaId } = require('./vendorUtilsDatabase.js');
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const SHOPIFY_URL = process.env.SHOPIFY_URL;

// Find fulfillment order ID by passed order ID
const fulfillmentOrders = async (shippingNotice) => {
    const orderId = shippingNotice.message.transactionSets[0].HL_loop[1].purchaseOrderReference[0].purchaseOrderNumber;
    console.log('Purchase order: ', orderId);
    try {
        const response = await axios.get(`https://${SHOPIFY_URL}/admin/api/2023-04/orders/${orderId}/fulfillment_orders.json`, {
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN
            }
        });
        console.log('Fulfillment Orders Retrieved');
        return response.data.fulfillment_orders;
    } catch (error) {
        console.error('Error fetching fulfillment orders: ', error);
        return [];
    }
};

// Add tracking data to matched fulfillment order(s)
async function postFulfillment(order) {
    try {
        const fulfillment = await axios.post(`https://shop-inspire-me-home-decor.myshopify.com/admin/api/2023-04/fulfillments.json`,
        {
            'fulfillment': {
                'line_items_by_fulfillment_order': [
                {
                    'fulfillment_order_id': order.fulfillment_order_id
                }],
                'location_id': order.location_id,
                'tracking_info': {
                    'number': order.tracking_number
                },
                'notify_customer': true
            }
        },
        {
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN
            }
        }
        );
        console.log('Shopify response: ', fulfillment.data);

    } catch (error) {
        if (error.response) {
            console.error('Error data:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        } else if(error.request) {
            console.error('Error request:', error.request);
        } else {
            console.error('Error Message:', error.message);
        }
        console.error('Error config', error.config);
    }
}

// Main function, takes an incoming 856 document, processes, and posts the tracking information to the matching order on Shopify
async function matchOrder(orderfulResponse, vendor) {   
    // TODO: Adjust the function to be iterative on the off chance someone tries to send multiple shipments in a single document
    const vendorData = await getVendorByIsaId(vendor);
    const locationID = vendorData.locationId;
    const orderIDNumber = orderfulResponse.message.transactionSets[0].HL_loop[1].purchaseOrderReference[0].purchaseOrderNumber;
    console.log('Location ID: ', locationID);
    const fulfillments = await fulfillmentOrders(orderfulResponse);

    let matchedFulfillmentOrder = null;
    for (const fulfillmentOrder of fulfillments) {
        if (fulfillmentOrder.assigned_location_id == locationID) {
            matchedFulfillmentOrder = fulfillmentOrder;
            console.log('Matched fulfillment order');
            break;
        }
    }

    if (matchedFulfillmentOrder) {
        console.log('Sending Fulfillment Order ID: ', matchedFulfillmentOrder.id);
        const order = {
            'fulfillment_order_id': matchedFulfillmentOrder.id,
            'tracking_number': orderfulResponse.message.transactionSets[0].HL_loop[0].referenceInformation[0].referenceIdentification.toString(),
            'order_id': orderIDNumber,
            'location_id': locationID
        };
        await postFulfillment(order);
    } else {
        console.log('No matching fulfillment order found');
    }
}

module.exports = matchOrder;