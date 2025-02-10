import Food from '../models/Food.js';
import multer from 'multer';

class FoodController { 
    async getAllFood(req, res) {
        try {
            const food = await Food.find();
            if (req.path.includes('/posts')) {
                let page = {
                    beerNav: "Beer",
                    mealsNav: "Meals",
                    weatherNav: "Weather",
                    logoutBtn: "Log Out",
                    loginBtn: "Log In",
                    searchHeader: "Find Recipe",
                    infoBtn: "View More",
                    singupBtn: "Sign up",
                    langBtn: "Language",
                    lang: "en",
                    path: "/"
                  };
                const username = req.user.username
                if (req.params) {
                    if (req.path.includes('/en') || req.path.includes('/ru')) {
                        page.path = req.path.slice(0, -3)
                    } else {
                        page.path = req.path
                    }
                    page.lang = req.params.lang
                }
                return res.render('all_food', { food, username, page });
            }
            res.json(food)
        } catch (err) {
            console.error('Error during getting food:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    async getFoodById(req, res) {
        try {
            const id = req.params.id;
            const food = await Food.findById({ _id: id });
            if (req.path.includes('/posts')) {
                let page = {
                    beerNav: "Beer",
                    mealsNav: "Meals",
                    weatherNav: "Weather",
                    logoutBtn: "Log Out",
                    loginBtn: "Log In",
                    searchHeader: "Find Recipe",
                    infoBtn: "View More",
                    singupBtn: "Sign up",
                    langBtn: "Language",
                    lang: "en",
                    path: "/"
                  };
                const username = req.user.username
                if (req.params) {
                    if (req.path.includes('/en') || req.path.includes('/ru')) {
                        page.path = req.path.slice(0, -3)
                    } else {
                        page.path = req.path
                    }
                    page.lang = req.params.lang
                }
                return res.render('post', { food, username, page });
            }
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
            const food = new Food({
                name: req.body.name,
                authorId,
                authorName, 
                descriptionEN: req.body.descriptionEN,
                descriptionRU: req.body.descriptionRU,
                image: `/uploads/${req.file.filename}`
              });            
            await food.save();
            console.log(`Food ${food.name} successfully added!`);
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