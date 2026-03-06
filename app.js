require('express-async-errors');
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);


const port = process.env.PORT || 3000;
const startServer = async () => {
  try {
    
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

startServer();
