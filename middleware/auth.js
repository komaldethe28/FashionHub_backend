import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    const { token } = req.headers;
    console.log('Auth middleware called. Token:', token || 'NOT PROVIDED');

    if (!token) {
        console.log('No token provided in headers');
        return res.json({ success: false, message: 'Unauthorized LOgin Required' })
    }

    try {
        const token_decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.body.userId = token_decoded.id;
        next();
        
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
export default authUser;