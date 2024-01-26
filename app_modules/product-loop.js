const axios = require('axios');
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const SHOPIFY_URL = process.env.SHOPIFY_URL;

async function fetchBarcode(variantID) {
    try {
        const response = await axios.get(`https://${SHOPIFY_URL}/admin/api/2023-04/variants/${variantID}.json`, {
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN
            }
        });
        return response.data.variant.barcode;
    } catch (error) {
        console.error('Error fetching barcode: ', error);
        return null; // Return null in case there is no barcode listed on Shopify
    }
}


// Loop through each line item in the order and create a PO1_loop for it
async function productLoopConstructor(lineItem) {
    const barcode = await fetchBarcode(lineItem.variant_id);

    let baselineItemData = {
        quantity: lineItem.quantity.toString(),
        unitOrBasisForMeasurementCode: "EA",
        unitPrice: lineItem.price.toString(),
        basisOfUnitPriceCode: "CP",
        productServiceIDQualifier: "UP",
        productServiceID: barcode ? barcode.toString() : "",
        productServiceIDQualifier1: "VN",
        productServiceID1: lineItem.sku.toString(),
        productServiceIDQualifier2: "IN",
        productServiceID2: lineItem.variant_id.toString()
    };

    if (!barcode) {
        delete baselineItemData.productServiceIDQualifier;
        delete baselineItemData.productServiceID;
    }

    return {
        baselineItemData: [baselineItemData],
        PID_loop: [{
            productItemDescription: [{
                itemDescriptionTypeCode: "F",
                productProcessCharacteristicCode: "08",
                description: lineItem.name.toString()
            }]
        }]
    }
}

module.exports = productLoopConstructor;
