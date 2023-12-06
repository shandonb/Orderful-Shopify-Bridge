const locationMap = {
    // Map Orderful ISA IDs to Shopify warehouse IDs
    // 'ISA ID': 'shopify warehouse id'
    'ODFLVENKY': '555555555555',
    'CLASSIC': '68144005311',
    'CLOUD9': '61872832703',
    '7183888200': '68143972543', // Godinger
    'NOURISON': '60623159487'
};

const getLocation = (isaId) => locationMap[isaId] || 'Unknown or unmapped ISA ID';

module.exports = getLocation;