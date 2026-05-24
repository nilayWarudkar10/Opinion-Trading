const express = require('express'); 
const cors = require('cors');       
const dotenv = require('dotenv');   
const tradeRoutes = require('./routes/tradeRoutes');
const marketRoutes = require('./routes/marketRoutes');
const connectDB = require('./config/db.js'); 
const authRoutes = require('./routes/authRoutes');
const http = require('http'); 
const { Server } = require('socket.io'); 

dotenv.config();     
const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite frontend URL
    methods: ["GET", "POST"]
  }
});

// Connect to Database
connectDB();

// Global App Configuration Configurations
app.use(cors());        
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.set('io', io);
app.set('socketio', io);

// Define Base Endpoint Router Integrations
app.use('/api/markets', marketRoutes);
app.use('/api/trades', tradeRoutes); 
app.use('/api/auth', authRoutes); 

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected'));
});

app.get('/', (req, res) => {
  res.send('The Opinion Trading API is running successfully!');
});

// START RUNTIME INSTANCE USING ONLY SERVER WRAPPER
const PORT = process.env.PORT || 5000; 
server.listen(PORT, () => {
  console.log(`🚀 Server is sprinting on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
});