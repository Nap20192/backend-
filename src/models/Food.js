import {Model,Schema} from 'mongoose'
import { User } from './user';
const FoodSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    author:{
        type: User.id,
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