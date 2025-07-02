const express = require('express')
const verifyToken = require('../middleware/verifyToken')
const router = express.Router();

router.get('/profile', verifyToken, async (req, res) =>{
    res.json({
        message: 'Welcome to the user',
        user: req.user
    })
});

module.exports = router;