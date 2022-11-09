const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://kaushik:k2003MANDI@cluster0.a5iakkw.mongodb.net/newlogin?retryWrites=true&w=majority",{
   useNewUrlParser:true,
   useUnifiedTopology:true ,
//    useCreateIndex:true,
//    useFindAndModify:false
}).then(()=>{
    console.log(`connection successful`);
}).catch((err)=>{
    console.log(err);
})
// mongoose.connect("mongodb://localhost:27017/formres",{