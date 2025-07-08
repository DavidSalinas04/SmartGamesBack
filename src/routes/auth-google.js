const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dotenv =require('dotenv')

dotenv.config();


router.post('/', async (req,res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(401).json({error: "code is required"});
    }

    try {
        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.Google_Client_Id,
            client_secret: process.env.Google_Client_Secret,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        })

        const { access_token } = tokenRes.data

        const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })

        const { id: googleId, email, name, picture } = data;
        
        if(!email || !googleId){
            return res.status(401).json({error: "Token invalid"});
        }

        //Search user in the data base
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    {googleId},
                    {email}
                ]
            }
        });

        //Create if there's no existing user
        if(!user){
            user = await prisma.user.create({
                data: {
                    email,
                    googleId,
                    name,
                    pictureUrl: picture
                }
            });
        } else if(!user.googleID){
            //Update if there's no googleId associate
            await prisma.user.update({
                where: { id: user.id},
                data: { googleId }
            })
        }

        if(user.mfaEnable){
            return res.status(200).json({mfaRequire: true, method: user.mfaMethod, userId: user.id});
        }

        const token = jwt.sign(
            {userId: user.id,email: user.mail},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        )
        return res.status(200).json({token, user})

    } catch (error) {
        console.error("Error on login with Google", error);
        return res.status(500).json({error: error.message});
    }
})

module.exports = router;