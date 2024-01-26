const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT
});

async function getVendorByIsaId(isaId) {
    const query = datastore.createQuery('Vendors').filter('isaId', '=', isaId);
    const [vendors] = await datastore.runQuery(query);

    if (vendors.length === 0) {
        return null
    }

    return vendors[0];
}

async function getVendorByLocationId(locationId) {
    const query = datastore.createQuery('Vendors').filter('locationId', '=', locationId);
    const [vendors] = await datastore.runQuery(query);

    if (vendors.length === 0) {
        return null
    }

    return vendors[0];
}

async function getVendorByName(name) {
    const query = datastore.createQuery('Vendors').filter('vendorName', '=', name);
    const [vendors] = await datastore.runQuery(query);

    if (vendors.length === 0) {
        return null
    }

    return vendors[0];
}

module.exports = {
    getVendorByIsaId,
    getVendorByLocationId,
    getVendorByName
};