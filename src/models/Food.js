import mongoose from 'mongoose';

const FoodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    descriptionRU: {
        type: String,
        required: true
    },
    descriptionEN: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Food = mongoose.model('Food', FoodSchema);
export default Food;
