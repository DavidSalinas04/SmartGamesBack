const jwt = require('jsonwebtoken');

function verifyToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token){
        return res.status(401).json({error: 'Token not found'});
    }

    try {
        let decoded;
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err){
        return res.status(401).json({error: 'Token invalid'});
    }
}

module.exports = verifyToken;