
import jwt from 'jsonwebtoken'
import User from '../models/User.js';
import UserData from '../models/UserData.js'

const authMiddleware = (req, res, next) => {

    try {
        const token = req.cookies.Access;
        console.log(token)
        if (!token) {
            console.error('No token provided');
            next();
        } else {
            const decoded = jwt.verify(token, "1234567");
            req.user = decoded;
            console.log(`Authenticated user: ${decoded.username} (ID: ${decoded.id}) (role:${decoded.role})`);
            next();
        }
        
    } catch (err) {
        console.error('Invalid token:', err.message);
    }
    
};

export default authMiddleware