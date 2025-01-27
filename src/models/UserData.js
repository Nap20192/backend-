import { Schema,model } from "mongoose";
const userData = new Schema({
    username: {
        type: String,
        required: true
    },
    searchHistory: [Object],
    viewedRecipes: [Object],
    favorites: [String]
});

const UserData = model('user_data', userData);

export default UserData