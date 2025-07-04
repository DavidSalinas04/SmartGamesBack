const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.generateTotp = async (req,res) => {
    const { userId } = req.body

    if ( !userId ) return res.status(403).json ({error: 'User not found'});

    const secret = speakeasy.generateSecret({
        name: `SmartGame ({userId})`,
    });

    await prisma.user.update({
        where: { id: userId },
        data: {
            mfaEnable: true,
            mfaMethod: "totp",
            mfaSecret: secret.base32,
        },
    });

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) =>{
        if (err) return res.status(500).json( {error: 'Error generating QR code'});

        res.json({
            qrcode: data_url,
        })
    });

}