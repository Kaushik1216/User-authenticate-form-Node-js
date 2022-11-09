
require("dotenv").config();
const express = require("express");
const path = require("path");
const app =express();
require("./src/db/confiq");
const Register = require("./src/models/registers");
const hbs =require("hbs");
const port = process.env.PORT || 8000;
const publicpath = path.join(__dirname,"./public");
const tempath = path.join(__dirname,"./templates/views");
const parpath =path.join(__dirname,"./templates/partials");
const auth =require("./src/middleware/auth")
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");

const core=require("cors")
var session = require('express-session')

//bcrpt js
const bcrypt = require("bcryptjs");
const { isGeneratorFunction } = require("util/types");

// to get data from user
app.use(express.json());
app.use(core());

app.use(cookieParser());//to use cookie parser as middleware

app.use(express.urlencoded({extended:false}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))

app.use(express.static(publicpath));
app.set("view engine","hbs");
app.set("views",tempath);
hbs.registerPartials(parpath);
app.get("/",(req,res)=>{
    res.render("index");
});
app.get("/secret", auth ,(req,res)=>{
    res.render("secret");
});
app.get("/logout", auth ,async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((element)=>{
               return element.token!== req.token;
        })
        res.clearCookie("jwt")
        
       await req.user.save();
       res.render("login")
    } catch (error) {
        res.status(500).send(error)
    }
});
app.get("/login",(req,res)=>{
    res.render("login");
});
app.get("/profile",(req,res)=>{
    res.render("profile")
})
app.get("/forget",(req,res)=>{
    res.render("forget");
})

//payment
const Razorpay = require('razorpay');


app.get("/pay",(req,res)=>{
    res.render("pay")
})


app.post("/payment",async (req,res)=>{
    let {amount}=req.body;
    var instance = new Razorpay({
        key_id: '3J9om4kjQkbUFnEd0Hgh2nb1',
        key_secret: 'rzp_test_OasY92K7mbyx8g',
      });
    let order = await instance.orders.create({
        "amount": amount * 100,
        "currency": "INR",
        "receipt": "receipt#1",
        "partial_payment": false,
      })
    res.status(201).json({
        success:true,
        order,amount,
    })
      
})


app.get("/password",(req,res)=>{
    res.render("password")
})
//create a new user in our database
app.post("/", async(req,res)=>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        const genderoption =req.body.gender;
        if(genderoption==="option1"){
            var gender = "Male";
        }
        else{
            var gender = "Female";
        }

        const hashpassord = await bcrypt.hash(password,10);
        if(password === cpassword){
           const registerEmployee = new Register({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            gender:gender,
            phone:req.body.phonenumber,
            age:req.body.age,
            password:hashpassord,
            confirmpassword:hashpassord
           })
           //to generate token
           //middleware

        const token = await registerEmployee.generateAutoToken();

        const registered = await registerEmployee.save();

        //THE res.cookie() function is used to set the cokie name to value
        //the value parameter may be a string or object convert to JSON.
        //res.cookie(name,value,[options])

        res.cookie("jwt",token,{
            expires:new Date(Date.now()+ 300000),//expires cookie within 3 sec
            httpOnly:true// with this property user can not do any think with cokie
        });
      
       
        res.status(201).render("index");
        }else{
            res.send("pasaword are not matching");
        }
    } catch(error){
        res.status(400).send(error);
    }
    
});
// login valisdaton

app.post("/login",async(req,res)=>{
    try{
        const email= req.body.email;
        const password= req.body.password;
        const useremail= await Register.findOne({email:email});
        const hashpassord = await bcrypt.compare(password,useremail.password);
        req.session.email=email;
        //genrating token while login 
        const token = await useremail.generateAutoToken();

        res.cookie("jwt",token,{
            expires:new Date(Date.now()+ 300000),//expires cookie within 3 sec
            httpOnly:true// with this property user can not do any think with cokie
        });
      


        if(hashpassord===true){
            res.status(201).render("index");
        }
        else{
            res.send("Password are not matching");
        }

    }catch(error){
      res.status(400).send("Invalid  Credentials")
    }
});
var x;
var useremail;
app.post("/forget",async(req,res)=>{
      try {
         useremail=req.body.email;
        let data= await Register.findOne({email:useremail});
         x =  Math.floor((Math.random() * 1000000) + 1);
        console.log(x);
        if(data){
          try {
            const msg={
                form:"kaushik.vishwakarma2003@gmail.com",
                to:useremail,
                subject:"Otp for reset password",
                text:` your otp is : ${x}`
            }
            var mail=nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:"kaushik.vishwakarma2003@gmail.com",
                    pass:"upoaseslryffazse"
                }
            })
           mail.sendMail(msg,(err)=>{
                if(err){
                    return console.log('error occure and mail not send')
                }else{
                    return console.log('Email send good luck kaushik');
                }
            })
            res.status(201).render("password");
          } catch (error) {
            console.log("emial not send")
          }
        }else{
            res.send("Password are not matching");
          }}
     catch (error) {
        console.log("error at forget")
      }
    })
 app.post("/password",async(req,res)=>{
        let otp = parseInt(req.body.otp);
        let newpass=req.body.Npassword;
        if(otp===x){
          try {
              const hashpassord = await bcrypt.hash(newpass,10);
              let query={email:useremail};
              let newval={password:hashpassord}
              let dbo= await Register.updateOne(query,newval);
              console.log("password is updated");
              res.status(201).render("login");
          } catch (error) {
              console.log("password is not updated");
          }}
        else{
            res.send("wrong otp");
            res.status(201).render("forget");
        }})
// app.post("/profile",async(req,res)=>{
//     try {
//     let changepassword=req.body.changepassword;
//     const email= req.body.email;

//     const useremail= await Register.findOne({email:email});
//     const hashpassord = await bcrypt.hash(password,10);
//     var myquery = { email: useremail };
//     var newvalues = { $set: {email:useremail,password:hashpassord } };
//     db.collections("registers").updateOne(myquery,newvalues,function(err, res) {
//         if (err) throw err;
//         console.log("1 document updated");
//         db.close();
//       })
//     } catch (error) {
//         res.status(400).send("wrong")
//     }
    
// })

app.listen(port,()=>{
    
    console.log(`server is running on port no ${port}`);
});