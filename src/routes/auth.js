const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/register
router.post('/register', async (req,res) => {
    const {email, password} = req.body;

    try {
        //Validate existing user
        const existingUser = await prisma.user.findUnique({where: {email}});
        if (existingUser) {
            return res.status(400).json({error: 'email already exists'});
        }

        //Hash
        const hashedPassword = await bcrypt.hash(password, 12);

        //Create User
        const newUser = await prisma.user.create({
            data: {
                email,
                password : hashedPassword
            }
        })

        return res.status(200).json({message: 'User registered successfully.', userID: newUser.id})
    }catch(err){
        return res.status(500).json({error: 'Error creating user', result: err});
    }

})

router.post('/login', async (req,res) => {
    const { email,password } = req.body;
    console.log(email)
    console.log(password)
    try{
        //Search user
        const existingUser = await prisma.user.findUnique({where: {email}});
        if (!existingUser) {
            return res.status(400).json({error: 'Incorrect email or password', ok: false});
        }

        // check password

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({error: 'Incorrect email or password', ok: false});
        }
        
        if (existingUser.mfaEnable && existingUser.mfaMethod) {
            return  res.status(200).json({
                mfaRequired: true,
                mfaMethod: existingUser.mfaMethod,
                userID: existingUser.id,
                ok: true});
        }

        // generate JWT
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h'}
        );

        // respond token
        return res.status(200).json({ token, ok:true })
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: 'Error trying to login', result: err});
    }
})

module.exports = router;