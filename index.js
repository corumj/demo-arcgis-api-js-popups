const express = require('express');
const Datastore = require('nedb');
const path = require('path');

const db = new Datastore({ filename: path.join(__dirname, 'data', 'locations'), autoload: true});

const app = express();
const port = (process.env.PORT || 3000);

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// webserver to serve the demo data entry/map app
app.get('/', (req, res) => {
    let dataEntryAppPath = path.join(__dirname, "index.html");
    res.sendFile(dataEntryAppPath);
});

// api routes
// POST new location, GET existing location
// POST is used by the front end to add a new record after address validation
// GET is used by the front end map to populate the popup
// Using NEDB to simulate a database transaction
// not because this needed it but because it was fun to learn
app.route('/api/location')
    .post((req, res) => {
        // model data to insert into nedb
        let doc = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            businessName: req.body.businessName
        }    
        console.log(doc);
        // insert into the datastore    
        db.insert(doc, (err, result) => {
            if (err) {
                res.send({
                    success: false,
                    error: err
                });
            } else {
                res.send({
                    success: true,
                    busid: result._id
                });
            }
        });
    })
    .get((req, res) => {
        let documentId = req.query.id;
        db.findOne( { _id: documentId }, (err, doc) => {
            if (err) {
                res.send(err);
            } else {
                res.send(doc);
            }
        });
    });

// start the server
app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});