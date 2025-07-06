const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req,res) => {
    const {token: googleToken } = req.body;

    if (!googleToken) {
        return res.status(401).json({error: "Token is required"});
    }

    try {
        const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${googleToken}`
            }
        })

        const { id: googleId, email, name, picture } = data;
        console.log(googleId);
        console.log(email);
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