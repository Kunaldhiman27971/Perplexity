// server.js ka main kaam hota hai server se connect karna aur database se connect karna. Ye file app.js ko import karti hai jisme express app banaya gaya hai. Aur database.js ko import karti hai jisme mongoose se database connect kiya gaya hai.


import "dotenv/config";
import app from './src/app.js';
import connectDB from './src/config/database.js';
connectDB();
import {testai } from './src/services/ai.service.js';
testai();

app.listen(3000,(()=>{
    console.log('listening on port 3000');
}))