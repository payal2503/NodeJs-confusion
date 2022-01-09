const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017/';
const dbname = 'conFusion';

MongoClient.connect(url, (err, client) => {

    assert.equal(err,null);

    console.log('Connected correctly to server');

    const db = client.db(dbname);
    const collection = db.collection("dishes");
    collection.insertOne({"name": "Uthappizza1", "description": "test1"},
    (err, result) => {
        assert.equal(err,null);

        console.log("After Insert:\n");
        console.log(result.ops);

        collection.find({}).toArray((err, docs) => {
            assert.equal(err,null);
            
            console.log("Found:\n");
            console.log(docs); //you can specify a filter heresaying name is equalTo an value..

            db.dropCollection("dishes", (err, result) => { //It will drop the specify collection(dishse) //Remove the dishes collection from my DB
                assert.equal(err,null);

                client.close();
            });
        });
    });

});

// "start": "node ./bin/www"