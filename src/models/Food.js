import {Model,Schema} from 'mongoose'
import { User } from './user';
const FoodSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    authorId:{
        type: User.id,
        required: true
    },
    authorName:{
        type: User.username,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
});