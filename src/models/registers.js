require("dotenv").config();

const mongoose = require("mongoose");

const jwt =require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    age:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    confirmpassword:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

//token
employeeSchema.methods.generateAutoToken =  async function(){
    try{
     const token = jwt.sign({_id:this._id.toString()},process.env.SECRET);
     this.tokens= this.tokens.concat({token:token});
    //  console.log(token)
    await this.save();
    return token;
    }catch(error){
       console.log(error);
    }
}




// creating collection
//model class

const Register = new mongoose.model("Register",employeeSchema);

module.exports =Register;