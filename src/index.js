import { createRequire } from 'module'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import axios from 'axios'
import AuthController from './controllers/AuthController.js'
import UserDataController from './controllers/UserDataController.js'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import { body } from 'express-validator';
import authMiddleware from './middleware/AuthMiddleware.js'
import https from 'https'

dotenv.config();
const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, '../public')))
app.set('view engine', 'ejs')
app.set('views')

app.use(cookieParser())

const API_KEY = '1d6dc3890cf79b7449306bced111270d';
const MONGO_URI = process.env.MONGO_URI 


const startDBConnection = async () => {
  try {
      await mongoose.connect(MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
      console.log(MONGO_URI)
  } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      process.exit(1);
  }
};

startDBConnection();
console.log("dd")

app.get('/login', (req, res) => {
  const failure = false
  res.render("login", { failure })
})

app.get('/signup', (req, res) => {
  const failure = false
  res.render("signup", { failure })
})

app.post('/register', 
  body('username'),
  body('password'),
  AuthController.register);



app.post('/login', AuthController.login);
app.post('/logout', AuthController.logout);
app.get('/getUsers',AuthController.getUser)



app.use(authMiddleware)


app.get('/', async (req,res)=>{
  let user = req.user
  let username
  let recipeData
  let favoriteData
  if (user) {
    username = user.username
    recipeData = await UserDataController.getViewedRecipes(username)
    favoriteData = await UserDataController.getFavoriteRecipes(username)
    console.log(favoriteData)
  } else {
    username = null
  }
  res.render('home', { username, recipeData, favoriteData })
  
})


app.get('/weather', async (req, res) => {
  const city =req.query.city
  const query = "Weather:" + city
  let user = req.user
  let username
  if (user) {
    username = user.username
    UserDataController.updateSearchHistory(username, query)
  } else {
    username = null
  }
  
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
  if (city) {
    try {
      const response = await axios.get(url);
      const weatherData = response.data;
      const lat = weatherData.coord.lat
      const lon = weatherData.coord.lon

      const photo = await axios.get(`https://api.unsplash.com/search/photos?query=${city}&client_id=yXWN-B1ouwIhIHNGXMFTnnuMRRtM0G6GQwbrmm_DAHg`)
      const p = photo.data.results[0]
      console.log(p); 
      res.render('weather',{weatherData,p,lat,lon,username})
      
  } catch (error) {
      console.error(error);
      res.status(500).render('error');
  }
  }
  else {
    res.render('weather_search', { username })
  }
    
});

app.get('/meals', async (req, res) => {
  const query = req.query.query ? req.query.query : ''
  const queryReceiver = 'https://www.themealdb.com/api/json/v1/1/search.php?s='
  let user = req.user
  let username
  if (user) {
    username = user.username
    UserDataController.updateSearchHistory(username, queryReceiver, query)
  } else {
    username = null
  }
  if (query.length > 0) {

  }
  try {
      const mealsResponse = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
      const mealsData = mealsResponse.data.meals
      if (mealsData) {
        res.render('meals', { mealsData, username })
      } else {
        res.render('meals', { mealsData, username })
      }
  } catch (error) {
      console.error(error)
      res.status(500).send('Error fetching data from APIs.')
  }
})


const proxy = {
  host: '115.241.63.10',
  port: 8888
};
app.get('/cocktails', async (req, res) => {
  const query = req.query.query ? req.query.query : '';
  const queryReceiver = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';
  let user = req.user;
  let username = user ? user.username : null;

  if (user) {
      UserDataController.updateSearchHistory(username, queryReceiver, query);
  }

  try {
      const cocktailsResponse = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/search.php?s=martini', {
        proxy: proxy
    })

      const cocktailsData = cocktailsResponse.drinks; 
      res.render('cocktails', { cocktailsData, username });

  } catch (error) {
      console.error("Error fetching data from API:", error.message);
      res.status(500).send('Error fetching data from APIs.');
  }
});



app.get('/checkfavorite', async (req, res) => {
  const recipeId = req.query.recipeId
  let user = req.user
  let username
  if (user) {
    username = user.username
    let isFavorite = await UserDataController.checkFavoriteRecipe(username, recipeId)
    res.json({isFavorite: isFavorite})
  } else {
    username = null
    res.status(400).json({ success: false});
  }
})

app.post('/addfavorite', async (req, res) => {
  const recipeId = req.body.recipeId
  const source = req.body.type
  let user = req.user
  let username
  if (user) {
    username = user.username
    await UserDataController.updateFavoriteRecipes(username, recipeId, source)
    res.status(200).json({ success: true});
  } else {
    username = null
    res.status(400).json({ success: false});
  }
  
})

app.post('/removefavorite', async (req, res) => {
  const recipeId = req.body.recipeId
  let user = req.user
  let username
  if (user) {
    username = user.username
    await UserDataController.removeFavoriteRecipes(username, recipeId)
    res.status(200).json({ success: true});
  } else {
    username = null
    res.status(400).json({ success: false});
  }
})

app.get('/admin', (req, res) => {
  let username = req.user.username
  if(req.user.role == 'admin'){
    res.render('admin',{username})
  } else {
    res.status(403).send('You are not an admin')
  }
})


app.put('/admin/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const updateData = req.body;

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

      if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
      }
      const admin = await Admin.findById(req.adminId);
      if (admin) {
          admin.history.push({
              username: updatedUser.username,
              date: new Date(),
              method: "UPDATE"
          });
          await admin.save();
      }

      res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
      res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

app.delete('/admin/:userId', async (req, res) => {
  console.log("delete")
  try {
      const { userId } = req.params;
      console.log(`user ${userId}`)
      const userToDelete = await User.findById(userId);
      console.log(userToDelete)
      if (!userToDelete) {
          return res.status(404).json({ message: "User not found" });
      }
      await User.findByIdAndDelete(userId);
      let adminId = req.user.id
      const admin = await Admin.findById(adminId);
      if (admin) {
          admin.history.push({
              username: userToDelete.username,
              date: new Date(),
              method: "DELETE"
          });
          await admin.save();
      }

      res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});

app.get('/instructions/:id', async (req, res) => {
  const recipeId = req.params.id
  const source = req.query.source
  let isFavorite = false
  let user = req.user
  let username
  if (user) {
    username = user.username
    await UserDataController.updateViewedRecipes(username, recipeId, source)
    isFavorite = await UserDataController.checkFavoriteRecipe(username, recipeId)
  } else {
    username = null
  }
  
  try {
    let apiUrl;
    if (source === 'meals') {
      apiUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
    } else if (source === 'cocktails') {
      apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
    } else {
      return res.status(400).send('Invalid source.');
    }

    const response = await axios.get(apiUrl);
    const recipeData = source === 'meals' ? response.data.meals[0] : response.data.drinks[0];
    const instructions = recipeData.strInstructions.split("STEP")

    res.render('instructions', { recipe: recipeData, username, isFavorite, recipeId, source });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching recipe details.');
  }
});

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
});
