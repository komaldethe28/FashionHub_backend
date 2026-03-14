import jwt from 'jsonwebtoken';
import 'dotenv/config';

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({ success: false, message: "Unauthorized Access" })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        const decodedId = token_decode?.id ?? token_decode
        const expectedId = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD

        if (decodedId !== expectedId) {
            console.log('adminAuth failed', { token, decodedId, expectedId })
            // return extra debug info during development so we can see what is being sent/decoded
            return res.json({ success: false, message: "Unauthorized Access", decodedId, expectedId })
        }
        next()
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export default adminAuth