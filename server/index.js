// // const express= require('express');
// // const mongoose=require('mongoose');

// // const app = express();
// // const connectDB= async()=>{
// // mongoose.connect('mongodb://localhost:27017/e-com');
// // const productSchema=new mongoose.Schema({});
// // const product = mongoose.model("product",productSchema);
// // const data = await product.find();
// // console.warn(data);
// // console.log("connection is successfully done !....")

// // }
// // connectDB();
// // app.get('/', (req,resp)=>{
// //     resp.send("app is working .........")
// // });

// // app.listen(5000)

//  const express= require('express');
//  const cors= require('cors');
//  require('./db/config');
//  const User = require('./db/User');
//  const app = express();
//  app.use(cors());
//  app.use(express.json());
//  app.post('/register',async (req,resp)=>{
//    try {
//       let user = new User(req.body);
//       let result = await user.save();
  
//       const resultArray = [result];

//       // Create a response object with the "data" array containing the result
//       const response = { data: resultArray, msg: "User Registered Successfully"};
  
//       resp.json(response);
//     } catch (error) {
//       console.error(error);
//       resp.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  
//   app.get('/getAllUsers', async (req, res) => {
//     try {
//       const users = await User.find();
//       res.json({ data: users, msg: "Users Retrieved Successfully" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });

//   app.listen(5000, () => {
//     console.log('Server is running on port 5000');
//   });


// index.js
const express = require('express');
const cors = require('cors');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
require('./db/config');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/products', productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log("Server is running on",PORT)
