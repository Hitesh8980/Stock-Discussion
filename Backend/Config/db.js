const mongoose = require('mongoose');

const connectDB = async()=>{
    try {
       await mongoose.connect(process.env.MONGO_URL);
       console.log('Database COnnected');
    } catch (error) {
        console.error('MongoDB connection error:', error); 
    }
};

module.exports=connectDB;
