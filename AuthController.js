import bcrypt from 'bcrypt';
import User from './User.js';
import jwt from 'jsonwebtoken';


const generateAccessToken = (id, username,role) => {
    const payload = {
        id,
        username,
        role 
    }
    console.log(payload);
    return jwt.sign(payload, "1234567", {expiresIn: "24h"});
}

class AuthController {
    async login(req, res) {
        try {
            const { username, password } = req.body;
            console.log(`Login attempt: ${username}`);
            const candidate = await User.findOne({ username });
            if (!candidate) {
                console.error(`User not found: ${username}`);
                return res.status(400).json({ message: "User not found" });
            }
            const valid = bcrypt.compareSync(password, candidate.password);
            if (!valid) {
                console.error(`Invalid password for user: ${username}`);
                return res.status(400).json({ message: "Invalid password" });
            }
            const token = generateAccessToken(candidate._id, candidate.username,candidate.role);
            const idString = candidate._id.toString(); 
            console.log(candidate.username)
            res.cookie('Access',token,{maxAge:24*60*60*1000,httpOnly:true})
            return res.json({ 
                token, 
                user: {
                    id: candidate._id,
                    username: candidate.username,
                    role: candidate.role
                }
            });
            } catch (err) {
            console.error('Error during login:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async register(req, res) {
        
        try {
            const { username, password } = req.body;
            
            console.log(`Register attempt: ${username}`);
            
            const candidate = await User.findOne({ username });

            if (candidate) {
                console.error(`User already exists: ${username}`);
                return res.status(400).json({ message: "User already exists" });
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            let user;
            if (username === "admin") {
                user = new User({ username, password: hashPassword, role: "admin" });
            } else {
                user = new User({ username, password: hashPassword, role: "ordinary mortal" });
            }
            
            await user.save();

            const token = generateAccessToken(user._id, user.username);

            res.cookie('Access', token, { httpOnly: true, maxAge:24*60*60*1000 });
            
            return res.json({token,user})
        } catch (err) {
            console.error('Error during registration:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getUser(req, res) {
        try {
            const users = await User.find();
            return res.json(users);
        } catch (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async logout(req,res,next){
        try{
            const {Access} = req.cookies;
            res.clearCookie('Access');
            return res.status(200).json({ message: "Logout successful" })
        }
        catch(e){
            console.log(e)
            next(e);
        }
    }
}

export default new AuthController();
