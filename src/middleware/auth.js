const jwt = require("jsonwebtoken");
const Register=require("../models/registers");


const auth = async(req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        const verifyuser=jwt.verify(token,"mynameiskaushikvishwakarmacomputerscienceandengineering" );
        const user = await Register.findOne({_id:verifyuser._id});
        req.token=token;
        req.user=user;
        next();
    } catch (error) {
        res.status(401).send(error);
    }
}

module.exports=auth;