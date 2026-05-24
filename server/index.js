// 1. Import the necessary libraries
const express = require('express'); 
const cors = require('cors');       
const dotenv = require('dotenv');   
const tradeRoutes = require('./routes/tradeRoutes');
const marketRoutes = require('./routes/marketRoutes');
const connectDB = require('./config/db.js'); 
const authRoutes = require('./routes/authRoutes');
const http = require('http'); // 1. Import HTTP module
const { Server } = require('socket.io'); // 2. Import Socket.io

// 2. Initialize the app
dotenv.config();     
const app = express();
const server = http.createServer(app); // 3. Create a server wrap
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite frontend URL
    methods: ["GET", "POST"]
  }
});

// 3. Connect to the Database
connectDB();

// 4. Middlewares (The "Security Checks")
// 4. Make 'io' accessible to our controllers
app.use(express.json()); 
app.set('io', io);
app.set('socketio', io);
app.use(cors());        
app.use('/api/markets', marketRoutes);
app.use('/api/trades', tradeRoutes); 
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes); 
app.use('/api/trades', tradeRoutes);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected'));
});

// 5. Test Route (To check if the server is alive)
app.get('/', (req, res) => {
  res.send('The Opinion Trading API is running successfully!');
});


app.use('/api/auth', require('./routes/authRoutes.js'));
app.use('/api/markets', require('./routes/marketRoutes.js'));
app.use('/api/trades', require('./routes/tradeRoutes.js'));

// 7. Start the Server
const PORT = process.env.PORT || 5000; 
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
app.listen(PORT, () => {
  console.log(`🚀 Server is sprinting on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  
});
