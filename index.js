const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require("cors")
const app =express();
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;

// port 
const port = process.env.PORT || 5000;

// middlewase 
app.use(cors());
app.use(express.json());


// Connect to db 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ujchq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        console.log('db connected successfully');
        const database = client.db('my_glassDB')
        const ProductCollection = database.collection('Product')
        const CartCollection = database.collection('cart')
        const userCollection = database.collection('users')
        const reviewCollection = database.collection('review')
    // post product api 
        app.post('/product', async(req,res)=>{
            const product = req.body
            console.log('post hitted',product);
            const result = await ProductCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });
    // post cart api 
        app.post('/cart', async(req,res)=>{
            const cart = req.body
            const result = await CartCollection.insertOne(cart);
            console.log(result);
            res.json(result);
        });
    // post user 
        app.post('/users', async(req,res)=>{
            const user = req.body
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
    // post review 
        app.post('/review', async(req,res)=>{
            const review = req.body
            console.log(review)
            const result = await reviewCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });
    // upsert user 
    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });
    // make admin 
    app.put('/users/admin',  async (req, res) => {
        const user = req.body;       
        const filter = { email: user.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.json(result);       
    })
    // get admin 
    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await userCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    });

    // get product api
        app.get('/product', async(req, res) =>{
           const cursor = ProductCollection.find({});
           const product = await cursor.toArray();
           res.send(product);           
        });
    // get review api
        app.get('/review', async(req, res) =>{
           const cursor = reviewCollection.find({});
           const review = await cursor.toArray();
           res.send(review);           
        });
    // get cart api
        app.get('/cart', async(req, res) =>{
           const cursor = CartCollection.find({});
           const cart = await cursor.toArray();
           res.send(cart);           
        });
    // get user api
        app.get('/users', async(req, res) =>{
           const cursor = userCollection.find({});
           const user= await cursor.toArray();
           res.send(user);           
        });
   
    // get my orders api
        app.get("/myorders/:email", async(req, res) =>{
            console.log(req.params.email);
            const cursor= await CartCollection.find({email: req.params.email });
            const cart = await cursor.toArray();
            res.send(cart);             
        });

    // delete service
        app.delete('/cart/:id' , async(req, res) =>{
            const id = req.params.id;
            const query = {_id:id}; 
            const result = await CartCollection.deleteOne(query);
            res.json(result);
            console.log("delete id",result);
        });

    // delete service
        app.delete('/product/:id' , async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}; 
            const result = await ProductCollection.deleteOne(query);
            res.json(result);
            console.log("delete id",result);
        });
    }

    finally{
        // await client.close();
    };
};

run().catch(console.dir);



app.get('/',(req, res)=>{
    res.send("Assignment server is running!!!")
});


app.listen(process.env.PORT || port, (req, res) => {
    console.log("listen to port",port);
});