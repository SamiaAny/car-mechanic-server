const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// const uri = "mongodb+srv://carmechanic:mbqK2JFHCgWf37xu@cluster0.wiin6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wiin6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    console.log('starting the ');
    res.send('send request');
});
app.get('/hello', (req, res) => {
    console.log('starting the hello');
    res.send('send request hello');
});

async function run() {
    try {
      await client.connect();
      const database = client.db("carMecanic");
      const servicesCollection = database.collection("services");
      // create a document to insert

      //get api current
      app.get('/services',async (req,res) => {
          const services = await servicesCollection.find({}).toArray();
          console.log('all service:',services);
          res.json(services);

      })

    //   get single service
      app.get('/services/:id', async (req,res)=> {
          const id = req.params.id;
          console.log('load id',id);
          const query = {_id:ObjectId(id)};
          const result = await servicesCollection.findOne(query);
          res.json(result);
      });

      //UPDATE API
      app.put('/services/:id', async (req,res) => {
        const id = req.params.id;
        const filter = {_id:ObjectId(id)};
        const service = req.body;
        const options = { upsert:true };
        console.log(service);
        const updateDoc = {
            $set: {
                Name: service.Name,
                price: service.price,
                description: service.description,
                img: service.img
            },
        };

        const result = await servicesCollection.updateOne(filter, updateDoc, options);

        // const result = await servicesCollection.replaceOne(filter,updateDoc,options);
        res.json(result);
    })

      //post api
      app.post('/services',async (req,res)=> {
          const service = req.body;
          
          const result = await servicesCollection.insertOne(service);
          console.log(result);
          res.json(result);
      });


      //DELETE API
      app.delete('/services/:id',async (req,res) => {
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          const result = await servicesCollection.deleteOne(query);
          console.log(result);
          res.json(result);
      })
    
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.listen(port, () => {
    console.log('car-mechanin running on port', port);
});
