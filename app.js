const express = require('express');
const connectDB = require('./config/db');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});


const startServer = async () => {
  try {
    
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

startServer();
