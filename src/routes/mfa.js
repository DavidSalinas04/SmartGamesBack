const express = require('express');
const router = express.Router();
const { prismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/verifyToken');
const {PrismaClient} = require("@prisma/client");
const multer = require('multer');
const fs = require('fs')
const path = require('path');

const jwt = require("jsonwebtoken");


const prisma = new PrismaClient();
const storage = multer.memoryStorage();
const upload = multer({storage});

router.post('/enable-mfa', verifyToken, upload.single('face'),async (req, res) => {
    const method  = req.body.method;
    const userId = req.user.userId;
    const faceImage = req.file?.buffer;

    //validate method
    if (method !== 'facial'){
        return res.status(400).json ({error: 'method MFA invalid'});
    }

    if (!faceImage){
        return res.status(400).json ({error: 'faceImage invalid'});
    }


    try {
        //Create folder if it doesnt exist
        const folderPath = path.join(__dirname, '..', 'faces')
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        // save image
        const filePath = path.join(folderPath, `${userId}.jpg`);
        fs.writeFileSync(filePath, faceImage);

        await prisma.user.update({
            where: {id: userId},
            data: {
                mfaEnable: true,
                mfaMethod: 'facial'
            }
        })
        return res.status(200).json({message: 'MFA activate and facial saved successfully'});
    }catch (err){
        console.log(err);
        return res.status(400).json({error: 'MFA activate failed'});
    }
})

router.post('/verify-mfa', upload.single('face'), async (req,res) => {
    const userId = req.body.userId;
    const imageBuffer = req.file?.buffer;

    if (!userId || !imageBuffer) {
        return res.status(400).json ({error: 'Image not provided'});
    }

    const evidenceIsValid = true;

    if(!evidenceIsValid) {
        return res.status(401).json ({error: 'Facial recognition failed'});
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const token = jwt.sign(
        {userId : user.id, email : user.email},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    );

    return res.status(200).json ({token});
})

module.exports = router;