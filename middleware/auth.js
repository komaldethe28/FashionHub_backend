import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {

    const { token } = req.headers;

    if (!token) {
        return res.json({ success: false, message: 'Unauthorized LOgin Required' })
    }

    try {
        const tocken_decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.body.userId = tocken_decoded.id;
        next();
        
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
export default authUser;