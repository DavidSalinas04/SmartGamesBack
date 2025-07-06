const express = require('express');
const cors = require ('cors');


const app = express();
app.use(cors());
app.use(express.json());

const authRouter = require('./routes/auth');
const privateRoutes = require('./routes/private');
const mfaRouter = require("./routes/mfa's/faceId");
const totpRouter = require("./routes/mfa's/totp");
const deactivateRouter = require("./routes/mfa's/deactivate");
const googleAuthRouter = require("./routes/auth-google");

app.use('/api', privateRoutes);
app.use('/api', authRouter);
app.use('/api', mfaRouter);
app.use('/api', totpRouter);
app.use('/api', deactivateRouter);
app.use("/api/auth/google", googleAuthRouter);

app.get('/', (req,res) => {
    res.send('API is working!');
})

module.exports = app;
