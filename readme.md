# Orderful/Shopify Bridge #

A simpe, Node.js-based, app to connect a Shopify store to Orderful's EDI environment. This app, with minimal configuration, is designed to be a "set it and forget it" solution to ensure that Shopify orders are sent to the correct third party vendors/trading partners as X12 **850 Purchase Order** documents, and that shipping information sent as 856 Advanced Shipping Notice and inventory feeds sent as **846 Inventory Inquiry/Advice** documents are received correctly and update the order status and/or inventory levels accordingly. The current setup is based on the specific EDI guidelines for the business it was developed for, but can be easily adjusted to suit your guidelines and data structure. Documentation is present throughout for modules and code blocks whose purpose or structure may be a little less than obvious.

----------

## Initial Setup ##
While the app as a whole should function right out of the box (designed to be deployed on Google Cloud App Engine), there is a little bit of preliminary setup that is required before the app can be deployed. First and foremost, any files that have " **-example** " appended to the file name require business-specific values to be entered to function correctly, and should have the " **-example** " removed from their file name before deploying.

- **app-example.yaml:** This file should have the environment variables replaced with the appropriate values for your specific deployment. This includes Shopify and Orderful API keys, the store URL, the business' ISA ID (as assigned in Orderful), and the URL for the HTTP endpoint.
- **filter-orders-example.js:** This module serves to separate orders into separate **850 Purchase Order** documents based on the assigned item vendor. If your dropship items are designated using different methods, such as metafields, this file will need some pretty heavy customization. It includes an optional search parameter for assigned fulfillment locations in case some items that would usually be fulfilled by an outside vendor should not be, on a per-order basis. For normal use, the `vendors` array should be populated with a comma-separated list of strings with the vendor name as listed in Shopify. The `thirdPartyWarehouseLocationId` variable should be assigned a string representing the Shopify warehouse ID for any fulfillment locations that should be ignored by the app.
	- *Note:* If an item has inventory listed in multiple locations, Shopify will occasionally assign a line item in an order to a fulfillment location that does not have inventory in stock. As this does not happen predictably or reliably, I could not account for it in the code, and is instead just something to be aware of and keep an eye out for.
- **get-isa-example.js:** This module holds a simple object assigning the vendor of an item (as assigned in Shopify) to the trading partner's ISA ID (as assigned in Orderful). The general structure is 'Vendor':'ISAID', and can be extended to however many vendors are needed (though after a certain point, it may be useful to consider utilizing a dedicated database for this operation). 
- **get-location-id-example.js:** Another simple connection module, this one will simply do the reverse of the above module; it returns the warehouse ID (as assigned by Shopify) for a given ISA ID (as assigned by Orderful). Similar to the above, it is simply an object with the ISA ID and the warehouse ID as key/value pairs. General structure is 'ISA ID':'Warehouse ID'. 

----------

## Deploying ##
As mentioned, the app, after the initial configuration, should be ready to deploy to gcloud as-is. There is an included **create-webhook.js** file that can be run via node to create the Shopify webhook if needed. Other than that, everything should be good to go! There is fairly extensive console logging for problem areas, so if, for any reason, documents are not being sent or received correctly, you should be able to check the logs on the cloud platform and see where the issue is happening. 

Once deployed, there should be no further need to interact with the app unless issues arise or breaking updates occur to either the Shopify or Orderful APIs. It is meant as a fully automatic bridge between the two, though a user interface for Shopify to track and/or resend orders is planned eventually.


----------

----------
## Final Notes ##
This app was built for a specific business and their data requirements. As such, it may not work immediately in every given scenario. My hope is that, at worse, it can serve as a decent starting point for anyone who needs to build a similar integration. In the case of X12 documents outside of the 846, 850, and 856 included, the code contained here should give you at least an idea how to handle them, though the actual data structure will largely depend on the guidelines set up by the EDI leader in that scenario.