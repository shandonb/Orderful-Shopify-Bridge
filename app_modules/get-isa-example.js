// Make sure to remove "-example" from the filename before deplying

const isaIdMap = {
    // Map Shopify vendor values to Orderful ISA ID Values 
    // 'Shopify Vendor': 'ORDERFULISAID',
    'Vendor1': 'TEXTISAID',
    'Vendor2': '00000000000000'
};

const getIsaId = (vendor) => isaIdMap[vendor] || 'Unknown/Unmapped Vendor';

module.exports = getIsaId;