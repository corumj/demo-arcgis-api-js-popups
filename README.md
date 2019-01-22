# Demo app for consuming non-spatial RESTful service in a map popup
This app is more a proof of concept than anything else.  I need to show that it is possible to consume a third party API to fill out data in an ArcGIS API for Javascript popup.  The app only works on localhost - it's not designed for, nor intended to be used in, production, but should have some useful code snippets to adapt.

## Overview
We have two systems: one that is spatial and one that is non-spatial.  They need to be integrated to provide some mapping capabilities, basic searching and querying, and robust popups.  We could have a nightly script copying data from the non-spatial system into the GIS database, where it is geocoded and made available through a map service.  This works but is delayed, new data will not show up until after the scheduled task is run.  It's also duplicating data for no good reason.  Instead, let us save the unique ID of the business generated in the non-spatial system, to the GIS database along with its location which validated against an address locator service to ensure accuracy.  We are able to avoid duplicating data and provide more real-time services since the map popup can consume the non-spatial API and retrieve data as soon as it's updated.

## Requirements
1. You will need your own feature service either from https://developers.arcgis.com or from a feature service located in ArcGIS Server 10.1 or above.  The featureService should provide access to a point feature class with a busid (business id) attribute and that's it.  We will use the busid attribute to query the third party RESTful API for the data needed to fill out the popup.  Update the businessFeatureService variable in dataEntryApp.js on line 9 with the URL to your feature service.
2. You will need an address locator service that provides the "suggest" operation.  The app defaults to the City of Chandler, AZ's locator service hosted on ArcGIS Server 10.5.1, but only provides the ability to geocode addresses within Chandler's city limits.  Update the addressLocatorUrl variable in dataEntryApp.js on line 11 with your address locator service.
3. If you wish to adapt this applicaiton to consume an existing non-spatial API you'll need to update the URL as well as the calls to the service.  This is not within the scope of this proof of concept, but I believe in you, you can do the thing.  
3. You'll need NodeJS installed.

## Instructions
1. Clone the app
2. run `npm install`
3. run `npm start`
4. Open your browser to http://localhost:3000
5. Enter a name, business name, and start typing an address.  Select the right address from the dropdown and click submit.
You should see a point appear on the map at the address provided (may need to update map extent if you are changing the area).
6. Click on the new point and you should see popup data with business information presented despite not saving any business information in the spatial database!  
