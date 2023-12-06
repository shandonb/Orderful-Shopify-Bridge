// Make sure to remove "-example" from the filename before deploying

const locationMap = {
    // Map Orderful ISA IDs to Shopify warehouse IDs
    // 'ISA ID': 'shopify warehouse id'
    'ISAID1': '555555555555',
    'ISAID2': '123456789012'
    // Add more ISA IDs and warehouse IDs as needed
};

const getLocation = (isaId) => locationMap[isaId] || 'Unknown or unmapped ISA ID';

module.exports = getLocation;