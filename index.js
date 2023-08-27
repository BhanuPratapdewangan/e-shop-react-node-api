// import librery 
import express, { response } from "express";
import cors from "cors";
import Jwt from "jsonwebtoken";

// import js file
import { } from "./db/config.js";
import userModel from "./db/user.js";
import productModel from "./db/product.js";

const app = express();
const jwtKey = "e-shop";

// use cors because it's allow share the resources across the application.
app.use(express.json());
app.use(cors());


// User SignUp API's
app.post('/signup', async(req, res) => {

    let data = new userModel(req.body);
    data = await data.save();
    data = data.toObject();
    delete data.password;
    res.send(data);
    res.end();
});


// User Login API's
app.post('/login', async(req, res) => {

    if(req.body.email   &&  req.body.password)
    {

        let data = await userModel.findOne(req.body).select('-password');

        if(data)
        {
            Jwt.sign({data}, jwtKey,{expiresIn:"2h"}, (err, token) => {
                if(err)
                {
                    res.send({result : "Data went wrong"});
                } else
                res.send({data, auth:token});
            })
        } else {
            res.send("Result : Data not found");
        }
    } else 
    {
        res.send("Data Not Found");
    }
})

// Add Product API's
app.post('/add-product', verifyToken, async(req, res) => {

    let data = new productModel(req.body);
    data = await data.save();
    res.send(data);
})


// Render Product List
app.get('/product-list', verifyToken, async(req, res) => {

    let data = await productModel.find();
    if(data.length>0)
    {
        res.send(data);
    } else  
    {
        res.send("Data not found");
    }
})

// Delete Product API's
app.delete('/delete-product/:id', verifyToken, async(req, res) => {

    let data = await productModel.deleteOne({_id:req.params.id});
    res.send(data);
})

// First Get the data from database for updating data
app.get('/get-product/:id', verifyToken, async(req, res) => {

    let data = await productModel.findOne({_id:req.params.id});
    if(data)
    {
        res.send(data);
    } else
    {
        res.send("Data not found");
    }
})

// Update Product API's
app.put('/update-product/:id', verifyToken, async(req, res) => {

    let data = await productModel.updateOne({_id:req.params.id},{$set : req.body});
    if(data)
    {
        res.send(data);
    } else 
    {
        res.send("Data not updated");
    }
})

// Search API's
app.get('/search-product/:key', verifyToken, async(req, res) => {

 let data = await productModel.find(
    {
       "$or" : [
        {name: {$regex:req.params.key}},
        {company:{$regex:req.params.key}},
        {category:{$regex:req.params.key}}
    ]
    });
    res.send(data);
})


function verifyToken(req, res, next){

    let token = req.headers["authorization"];
    
    if(token)
    {
        token = token.split(' ')[1];
        Jwt.verify(token, jwtKey, (err, valid)  => {
            if(err)
            {
                res.status(403).send({result:"Please enter correct token with headers"});
            } else
            {
                next();
            }
        })
    } else
    {
        res.status(401).send({result:"Please provide token with headers"});
    }
    // console.log("Middleware created...!", token);
}

// Listen port 4500 on server
app.listen(4500, () => {
    console.log("Server Started...!");
})