// Make sure to remove "-example" from the filename before deploying

const axios = require('axios');
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const SHOPIFY_URL = process.env.SHOPIFY_URL;
const convertToX12 = require('./convert-order.js');

/* This module is part one of the conversion to X12. Since customers are able to order items from multiple vendors at the same time, it's important
    that the bridging app be able to not only send the 850 to each relevant vendor, but also not send any extraneous data to the vendors. To that end
    this module separates the line items by vendor (with optional location filter), and will only send the relevant line item data to any given vendor.*/

// Fetch list of fulfillment orders for any given order ID
const fetchFulfillmentOrders = async (orderId) => {
    try {
        const response = await axios.get(`https://${SHOPIFY_URL}/admin/api/2023-04/orders/${orderId}/fulfillment_orders.json`, {
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN
            }
        });
        console.log('Fullfillment Order Retrieved');
        return response.data.fulfillment_orders;
    } catch (error) {
        console.error('Error fetching fulfillment orders: ', error);
        return [];
    }
};

// Create separate order documents for each fulfillment order in the order, ignoring non-dropship
const filterOrders = async (orderData) => {
    // We are identifying dropship items by their item vendor property on Shopify
    const vendors = ["Vendor 1", "Vendor 2", "Vendor 3", "Vendor 4", "Vendor 5"]; // Replace with list of vendors to be connected, additional vendors can be added

    /*  This next variable is really only important if, for any reason, items that are usually dropship are not being dropshipped.
        For example, if you have a centralized location for returns, or if you are selling any samples received from a vendor.
        In these cases, we want to make sure that the item is not being sent to both the dropship vendor and the warehouse you operate.
        To accomplish this, we look at the assigned location ID for the items as well as the vendor. If Shopify has assigned the line item
        to ship from a location that is not a dropship warehouse, that item should not then also be sent to a dropship vendor.             */

    const thirdPartyWarehouseLocationId = "WarehouseIDToBeIgnored"; // Replace with Shopify warehouse ID(s) of ship-from location(s) that should not be processed

    console.log('Starting to fetch fulfillment orders...');
    const fulfillmentOrders = await fetchFulfillmentOrders(orderData.id);
    console.log('Fulfillment orders fetched:', fulfillmentOrders.id);

    // Initialize a blank object to hold the different fulfillment orders
    const filteredOrders = {};

    // Set up a new array for each vendor
    vendors.forEach(vendor => {
        filteredOrders[vendor] = [];
    });

    console.log('Starting to filter line items...');

    // Sorting each item into the proper array by vendor
    // As mentioned above, if an item is from a dropship vendor, but not being dropshipped, this section will ignore it
    orderData.line_items.forEach(item => {
        console.log('Checking line item:', item.id);
        const fulfillmentOrder = fulfillmentOrders.find(fo => fo.line_items.some(li => li.line_item_id === item.id));
        console.log('Matching fulfillment order:', fulfillmentOrder.id);
        if (fulfillmentOrder && fulfillmentOrder.assigned_location_id !== thirdPartyWarehouseLocationId && vendors.includes(item.vendor)) {
            console.log('Adding item to filteredOrders:', item.id);
            filteredOrders[item.vendor].push(item);
        }
    });

    console.log('Filtered orders:', filteredOrders.id);

    // For each fulfillment order in the order, convert the matched orders to an X12-like JSON format and send to Orderful
    for (let vendor in filteredOrders) {
        console.log('Checking vendor:', vendor);
        if (filteredOrders[vendor].length > 0) {
            console.log('Processing order for vendor:', vendor);
            const modifiedOrderData = { ...orderData, line_items: filteredOrders[vendor] };
            console.log('Modified order data for vendor:', modifiedOrderData.id);
            await convertToX12(modifiedOrderData, vendor);
            console.log('Processed order for:', vendor);
        }
    }
};

module.exports = filterOrders;

