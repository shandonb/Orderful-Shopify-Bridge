const axios = require('axios');
const getLocationId = require('./get-location-id.js');
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const SHOPIFY_URL = process.env.SHOPIFY_URL;

/* For the inventory feed, we have to do a bit of a workaround. The Shopify REST API doesn't allow finding a product by the SKU, but we can't assume
    that our vendors will know the product ID for their items on Shopify. As such, we have to leverage Shopify's GraphQL API to find the item based 
    on its SKU, then return the item inventory ID from there. As a note: This will only work if every item in your store has a unique SKU. If a SKU
    that will be restocked using this bridge shares a SKU with another item, this will likely error out. In those cases, you should find some value
    that is unique to each product and search by that instead (such as UPC or a mutually-agreed-upon metafield). In a worst-case scenario, it may be 
    necessary to ensure that the vendor has a map of their product IDs or inventory item IDs and is able to send that instead.                       */

const getInventoryId = async (sku, inventoryId = null) => {
    if (inventoryId) {
        return inventoryId
        } else {
            const query = `
                query {
                    products(first: 1, query: "sku:${sku}") {
                        edges {
                            node {
                                variants(first: 1) {
                                    edges {
                                        node {
                                            inventoryItem {
                                                id
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;

            try {
                const response = await axios.post(`https://${SHOPIFY_URL}/admin/api/2023-04/graphql.json`, { query }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': ACCESS_TOKEN
                    },
                });

                return response.data.data.products.edges[0].node.variants.edges[0].node.inventoryItem.id
            } catch (error) {
                console.error('Error fetching inventory item ID by SKU: ', error);
                throw error;
            }
        }
    }

const postInventory = async (inventoryFeed) => {

    // Using location ID ensures that the inventory is added to the correct inventory location, rather than to the default location
    const locationId = getLocationId(inventoryFeed.sender.isaId);
    
    // Here we iterate through the LIN_loops of the incoming document in case vendors are sending inventory for multiple items in one document
    for (const item of inventoryFeed.message.transactionSets[0].LIN_loop) {    
        const inventoryItem = await getInventoryId(item.itemIdentification[0].productServiceID1, item.itemIdentification[0].productServiceID2)
        const inventoryQty = item.QTY_loop[0].quantityInformation[0].quantity;
        try {
            const inventoryUpdate= await axios.post(`https://${SHOPIFY_URL}/admin/api/2023-04/inventory_levels/adjust.json`,
            {
                'inventory_level': {
                    'location_id': locationId,
                    'inventory_item_id': inventoryItem,
                    'available_adjustment': inventoryQty
                }
            },
            {
                headers: {
                    'X-Shopify-Access-Token': ACCESS_TOKEN
                }
            }
            );
            console.log('Shopify response:', inventoryUpdate.data);
        } catch (error) {
            console.error('Error posting inventory: ', error);
        }
    }
}

module.exports = postInventory;