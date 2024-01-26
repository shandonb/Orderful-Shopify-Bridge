# Orderful/Shopify Bridge #

A simple, NodeJS-based, app to connect a Shopify store to Orderful's EDI environment. This app, with minimal configuration, is designed to be a "set it and forget it" solution to ensure that Shopify orders are sent to the correct third party vendors/trading partners as X12 **850 Purchase Order** documents, and that shipping information sent as **856 Advanced Shipping Notice** and inventory feeds sent as **846 Inventory Inquiry/Advice** documents are received correctly and update the order status and/or inventory levels accordingly. The current setup is based on the specific EDI guidelines for the business it was developed for, but can be easily adjusted to suit your guidelines and data structure. Documentation is present throughout for modules and code blocks whose purpose or structure may be a little less than obvious.

## Disclaimer ##
This app operates on a "minimum required data" philosophy. If your integration requires more specific data in any documents, you should be sure to add the fields into the relevant document conversion modules.


----------

## Initial Setup ##
While the app as a whole should function right out of the box (designed to be deployed on Google Cloud App Engine), there is a little bit of preliminary setup that is required before the app can be deployed. First and foremost, any files that have " **-example** " appended to the file name require business-specific values to be entered to function correctly, and should have the " **-example** " removed from their file name before deploying.

- **app-example.yaml:** This file should have the environment variables replaced with the appropriate values for your specific deployment. This includes Shopify and Orderful API keys, the store URL, the business' ISA ID (as assigned in Orderful), and the URL for the HTTP endpoint.
- **filter-orders-example.js:** This module serves to separate orders into individual **850 Purchase Order** documents based on assigned fulfillment location IDs. Each line item is sorted into their different fulfillment orders, then each fulfillment order present is mapped to the correct vendor based on the assigned_location_id value. 
- **Vendors:** This is not a file present in the repository, but rather a Google Datastore with a map of all vendors and their related information. Previously this was managed through multiple modules and maps. The Datastore used should be created in the same project that the app will be deployed to. 

----------

## Deploying ##
As mentioned, the app, after the initial configuration, should be ready to deploy to gcloud as-is. There is an included **create-webhook.js** file that can be run via node to create the Shopify webhook if needed. Other than that, everything should be good to go! There is fairly extensive console logging for problem areas, so if, for any reason, documents are not being sent or received correctly, you should be able to check the logs on the cloud platform and see where the issue is happening. 

Once deployed, there should be no further need to interact with the app unless issues arise or breaking updates occur to either the Shopify or Orderful APIs. It is meant as a fully automatic bridge between the two, though a user interface for Shopify to track and/or resend orders is planned eventually.


----------

----------
## Final Notes ##
This app was built for a specific business and their data requirements. As such, it may not work immediately in every given scenario. My hope is that, at worst, it can serve as a decent starting point for anyone who needs to build a similar integration. In the case of X12 documents outside of the 846, 850, and 856 included, the code contained here should give you at least an idea how to handle them, though the actual data structure will largely depend on the guidelines set up by the EDI leader in that scenario.