const express = require('express');
const cors = require ('cors');


const app = express();
app.use(cors());
app.use(express.json());

const authRouter = require('./routes/auth');
const privateRoutes = require('./routes/private');
const mfaRouter = require('./routes/mfa');

app.use('/api', privateRoutes);
app.use('/api', authRouter);
app.use('/api', mfaRouter);


app.get('/', (req,res) => {
    res.send('API is working!');
})

module.exports = app;
