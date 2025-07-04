const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.deactivate = async (req, res) => {
    const {userId} = req.body;

    if(!userId) {
        return res.status(400).json({error: 'User not found'});
    }

    const user = await prisma.user.findUnique({
        where: {id: userId},
    });

    if (!user || !user.mfaEnable) {
        return res.status(400).json({error: 'User doesnt have mfa activate'});
    }

    await prisma.user.update({
        where: {id: userId},
        data: {
            mfaEnable: false,
            mfaMethod: null,
            mfaSecret: null,
        }
    })

    return res.status(200).json({success: true, message: 'Successfully deactivated'});
}