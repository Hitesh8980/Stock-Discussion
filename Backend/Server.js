require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./Config/db')
const userRouter = require('./Routes/userRoute')
const postRouter = require('./Routes/postRoute')
const commentRouter = require('./Routes/commentRoute')
const app = express();
const PORT= process.env.PORT || 3002;
const socketConfig = require('./Socket/socket')


app.use(express.json());
app.use('/user',userRouter)
app.use('/post',postRouter);
app.use('/comments',commentRouter);







const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
socketConfig(io);








app.listen(PORT,async()=>{
    try {
      await connectDB()  
      console.log(`Server running on port ${PORT}`);
    } catch (error) {
        
    }
});