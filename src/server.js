const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRouter = require('./routers/auth');
const userRouter = require('./routers/user');

dotenv.config();
const app = express();

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(cookieParser());
app.use(express.json());

// router

app.use('/v1/router', authRouter);
app.use('/v1/user', userRouter);

app.listen(8000, () => {
  console.log('Server is running');
});
