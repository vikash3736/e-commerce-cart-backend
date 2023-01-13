const express = require('express');
const cors = require('cors');
const uuid = require('uuid');

// I have given secret key
const stripe = require('stripe')("sk_test_51MP6ZBSDouJ1T5G0rAEWvvqFt4qhIpjk1U2kWwNO1lgEBQp1zrd0ZnuX1qTymGeaWvTMtkdItFGu0H1HxwPCHyRz00FpffcWBB");

const app = express();
const port = process.env.PORT;

//Middlewares

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Hello from backend");
})

app.post('/payment',(req,res) => {
    const {product,token} = req.body;
    console.log("PRODUCT",product);
    console.log("PRICE",product.price);
    const idempotencyKey = uuid();

    return stripe.customers.create({
        email:token.email,
        source:token.id
    })
    .then(customer =>{
        stripe.charges.create({
            amount: product.price * 100,
            currency: "INR",
            customer:customer.id,
            receipt_email: token.email,
            description: `Purchase of ${product.name}`,
            shipping:{
                name : token.card.name,
                address:{
                    country: token.card.address_country
                }
            }
        },{idempotencyKey})
    })
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err))
})

app.listen(port,()=>{
    console.log(`Server is running in port ${port}`);
})