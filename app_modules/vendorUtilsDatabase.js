const { Datastore, PropertyFilter } = require('@google-cloud/datastore');

/* This module is designed to match vendor data with a Google Datastore containing a map of the vendors and the data
    that the app will need to function properly. Basic setup for the Datastore is as follows:
    Kind name: Vendors
    Entity properties:
    vendorName: [Name of the Vendor],
    isaId: [Vendor ISA ID as registered in Orderful],
    locationId: [Vendor Location ID as provided by Shopify],
    stream: [TEST or LIVE, depending on need]

    As a note, if you aren't sure of the Location ID for a vendor, the easiest method to find it is to go to your
    Shopify admin, go to your Settings, select Locations, click on the location you are unsure of, and look at the
    URL. The URL should end with a series of numbers. That sequence of numbers is the Location ID for that location. */



const datastore = new Datastore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT
});

async function getVendorByIsaId(isaId) {
    const query = datastore
        .createQuery('Vendors')
        .filter(new PropertyFilter('isaId', '=', isaId));
    const [vendors] = await datastore.runQuery(query);

    if (vendors.length === 0) {
        return null
    }

    return vendors[0];
}

async function getVendorByLocationId(locationId) {
    const query = datastore
        .createQuery('Vendors')
        .filter(new PropertyFilter('locationId', '=', locationId));
    const [vendors] = await datastore.runQuery(query);

    if (vendors.length === 0) {
        return null
    }

    return vendors[0];
}

async function getVendorByName(name) {
    const query = datastore
        .createQuery('Vendors')
        .filter(new PropertyFilter('vendorName', '=', name));
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