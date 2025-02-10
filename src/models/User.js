import { Schema, model } from "mongoose";

const AdminSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    user_management_history: [
        {
            username: {
                type: String,
                required: true
            },
            date: {
                type: Date, 
                required: true
            },
            method: {
                type: String,
                required: true
            }
        }
    ],
    post_management_history: [
        {
            post: {
                type: String,
                required: true
            },
            date: {
                type: Date, 
                required: true
            },
            method: {
                type: String,
                required: true
            }
        }
    ]
});

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
});

const Admin = model('Admin', AdminSchema);
const User = model('User', UserSchema);

export default User
export {User,Admin}
