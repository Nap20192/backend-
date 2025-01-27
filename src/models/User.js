import { Schema,model } from "mongoose";
const LikedSchema = new Schema({

})
const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type:String,
        required:true
    },
    creationDate: {
        type: String,
        required: true
    },
    updateDate:[String]
});

const User = model('User', userSchema);

export default User