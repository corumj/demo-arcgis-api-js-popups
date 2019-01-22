require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Home",
    "dojo/domReady!"
], function(Map, MapView, FeatureLayer, Home) {
    // config variables
    var businessFeatureService = 'https://services5.arcgis.com/Opzhw6sh9laJo3bA/arcgis/rest/services/businesses/FeatureServer';
    var busiessDetailsApiUrl = 'http://localhost:3000/api/location';
    var addressLocatorUrl = 'https://gis.chandleraz.gov/arcgis/rest/services/Geocoders/LIS_ADDRESS_PNT_V/GeocodeServer';
    // setup form stuff
    // setup suggestions on the address form
    var magicKeys = [] //save the final set of suggestions so the magicKey can be accessed in the onSelect function
    var busAddrSuggest = new autoComplete({
        selector: 'input[name="busAddress"]',
        source: async (term, suggestions) => {
            try {
                // consume the city of chandler location service suggestion endpoint to provide list of addresses to user
                // must be formatted as array so suggestions are stripped of their esri magickeys and put into an array 
                // before being sent to the suggestions callback function
                let response = await fetch(`${addressLocatorUrl}/suggest?text=${term}&maxSuggestions=25&f=json`);
                let json = await response.json();
                let suggestArr = [];
                json.suggestions.forEach((element) => {
                    suggestArr.push(element.text);
                });
                magicKeys = json.suggestions;
                suggestions(suggestArr);
            } catch(err) {
                console.log(err);
                suggestions([]);
            }

        },
        onSelect: async (e, term, item) => {
            // When a suggestion is selected, fetch the xy so it can be used to create a point for the business
            // this consumes the actual findAddressCandidates endpoint of the location service
            // Using the magickey from above, we are able to locate the exact address record the user selects
            // Ideally we would also check the geocode score on the response from this endpoint and
            // validate it's at a 100% or above a certain threshold we deem acceptable
            magicKeys.forEach(async (element) => {
                if (element.text === term) {
                    try {
                        let response = await fetch(`${addressLocatorUrl}/findAddressCandidates?magicKey=${element.magicKey}&outSR=4326&f=pjson`);
                        let json = await response.json();
                        $( 'input[name="xcoord"]' ).val(json.candidates[0].location.x);
                        $( 'input[name="ycoord"]' ).val(json.candidates[0].location.y);
                    } catch(err) {
                        console.log(err);
                    }
                }
            });
        }
    });
    // handle submit form - posting data to fake CLASS endpoint and feature service
    $( '#submitForm' ).on('click', async (e) => {
        e.preventDefault();
        try {
            let postFormResponse = await Promise.resolve($.post(busiessDetailsApiUrl, $( 'form#submitBusiness' ).serialize()));
            if (postFormResponse.success === true) {
                //create a new feature from the geometry stored on the form 
                let newFeature = {
                    "geometry" : {"x" : $( 'input[name="xcoord"]' ).val(), "y" :  $( 'input[name="ycoord"]' ).val()},  
                    "attributes" : {
                    "busid" : postFormResponse.busid
                    }
                }
                let newFeatureArr = [];
                newFeatureArr.push(newFeature);
                let postFeatureResponse = await Promise.resolve( $.post(businessFeatureService + '/0/applyEdits', {
                    f: 'json',
                    adds: JSON.stringify(newFeatureArr)
                }));
                console.log(postFeatureResponse);
                business.refresh();
                $('#submitBusiness')[0].reset();
            }
        } catch(err) {
            console.log(err);
        }

    });

    // Setup map stuff
    var map = new Map({
        basemap: "streets"
    });

    var view = new MapView({
        container: "viewDiv",
        map: map,
        zoom: 12,
        center: [-111.8414, 33.3063]
    });

    var homeBtn = new Home({
        view: view
    });

    view.ui.add(homeBtn, "top-left");

    var business = new FeatureLayer({
        url: businessFeatureService,
        outFields: ['*']
    });

    map.add(business);

    var queryBusinessLayer = function(target) {
        console.log(target);
        console.log(target.graphic.attributes.busid);
        return fetch(`${busiessDetailsApiUrl}?id=${target.graphic.attributes.busid}`)
        .then(function(response) {
            console.log('formatting response as json');
            return json = response.json();
        })
        .then(function(json) {
            return `
            <p>First Name: ${json.firstName}</p>
            <p>Last Name: ${json.lastName}</p>
            <p>Business Name: ${json.businessName}</p>
            `
        })
    }
    var businessPopupTemplate = {
        title: "OMG a popup",
        content: queryBusinessLayer
    }
    business.popupTemplate = businessPopupTemplate;
});