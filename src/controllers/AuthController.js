import bcrypt from 'bcrypt';
import { User, Admin } from '../models/User.js';
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
            const admin = await Admin.findOne({ username });
            const ordinary = await User.findOne({ username });
            let candidate = admin || ordinary;
            const failure = true
            let errorMsg
            if (!candidate) {
                console.error(`User not found: ${username}`);
                errorMsg = 'User not found. Try signing up.'
                return res.render('login', { failure, errorMsg })
            }
            const valid = bcrypt.compareSync(password, candidate.password);
            if (!valid) {
                console.error(`Invalid password for user: ${username}`);
                errorMsg = 'Invalid password.'
                return res.render('login', { failure, errorMsg })
            }
            const token = generateAccessToken(candidate._id, candidate.username,candidate.role);
            const idString = candidate._id.toString(); 
            console.log(candidate.username)
            res.cookie('Access',token,{maxAge:24*60*60*1000,httpOnly:true})
            res.redirect('/')
            // return res.json({ 
            //     token, 
            //     user: {
            //         id: candidate._id,
            //         username: candidate.username,
            //         role: candidate.role
            //     }
            // });
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

            const failure = true
            let errorMsg

            if (candidate) {
                console.error(`User already exists: ${username}`);
                errorMsg = 'User already exists.'
                return res.render('signup', { failure, errorMsg })
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            let user;
            if (username === "admin" || username === "Rakhat Lucum" || username === "Nikolay Kogay") {
                user = new Admin({ username, password: hashPassword, role: "admin" });
            } else {
                user = new User({ username, password: hashPassword, role: "ordinary mortal" });
            }
            
            await user.save();

            const token = generateAccessToken(user._id, user.username,user.role);
            res.cookie('Access', token, { httpOnly: true, maxAge:24*60*60*1000 });
            res.redirect('/')
        } catch (err) {
            console.error('Error during registration:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getUser(req, res,) {
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
            console.log("Logout successful")
            return res.redirect('/login')
        }
        catch(e){
            console.log(e)
            next(e);
        }
    }
}

export default new AuthController();
