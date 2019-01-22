# Demo app for consuming non-spatial RESTful service in a map popup
This app is more a proof of concept than anything else.  I need to show that it is possible to consume a third party API to fill out data in an ArcGIS API for Javascript popup.  The app only works on localhost - it's not designed for, nor intended to be used in production, but should have some useful code snippets to adapt.

## Requirements
1. You will need your own feature service either from https://developers.arcgis.com or from a feature service located in ArcGIS Server 10.1 or above.  The featureService should provide access to a point feature class with a busid (business id) column.  We will use the column to query the third party RESTful API for the data needed to fill out the popup.  Update the businessFeatureService variable in dataEntryApp.js on line 9 with the URL to your feature service.
2. You will need an address locator service that provides the "suggest" operation.  The app defaults to the City of Chandler, AZ's locator service hosted on ArcGIS Server 10.5.1, but only provides the ability to geocode addresses within Chandler's city limits.  Update the addressLocatorUrl variable in dataEntryApp.js on line 11 with your address locator service.
3. You'll need NodeJS installed.

## Instructions
Clone the app
run `npm install`
run `npm start`
Open your browser to http://localhost:3000
Enter a name, business name, and start typing an address.  Select the right address from the dropdown and click submit.
You should see a point appear on the map at the address provided (may need to update map extent if you are changing the area).
Click on the new point and you should see popup data with business information presented despite not saving any business information in the spatial database!  
