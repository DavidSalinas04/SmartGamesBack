const speakeasy = require('speakeasy');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.verifyTotp = async (req, res) => {
    const { userId, token } = req.body;

    console.log(userId);
    console.log(token);
    if(!userId || !token ) {
        return res.status(400).json({error: 'No user with this id'});
    }

    const user = await prisma.user.findUnique({
        where: {id: userId },

    })


    if (!user || user.mfaMethod !== "totp" || !user.mfaSecret) {
        return res.status(400).json({error: 'No user with totp secret'});
    }

    const isValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token,
        window: 1,
    });

    if (!isValid) {
        return res.status(400).json({error: 'Invalid token'})
    }

    res.json({success: true, message: 'Token verified'});
}