import Food from '../models/Food.js';

class FoodController { 
    async getAllFood(req, res) {
        try {
            const food = await Food.find();
            return res.json(food);
        } catch (err) {
            console.error('Error during getting food:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    async getFoodById(req, res) {
        try {
            const { id } = req.params;
            const food = await Food.findById(id);
            return res.json(food);
        } catch (err) {
            console.error('Error during getting food:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async createFood(req, res) {
        try {
            const authorId = req.user.id;
            const authorName = req.user.username;
            const { name, descriptionRU,descriptionEN, image } = req.body;
            const food = new Food({ name, descriptionRU,descriptionEN, authorId, authorName, image });
            await food.save();
            console.log(`Food ${name} successfully added!`);
            return res.json(food);
        } catch (err) {
            console.error('Error during creating food:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async updateFood(req, res) {
        try {
            const { id } = req.params;
            const { name, descriptionRU,descriptionEN, image } = req.body;
            const food = await Food.findByIdAndUpdate(id, { name,descriptionRU,descriptionEN, image }, { new: true });
            console.log(`Food ${name} successfully updated!`);
            return res.json(food);
        } catch (err) {
            console.error('Error during updating food:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async deleteFood(req, res) {
        try {
            const { id } = req.params;
            await Food.findByIdAndDelete(id);
            console.log(`Food successfully deleted!`);
            return res.json({ message: "Food successfully deleted!" });
        } catch (err) {
            console.error('Error during deleting food:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
export default new FoodController();