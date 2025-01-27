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
  res.render("login")
})

app.get('/signup', (req, res) => {
  res.render("signup")
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
  if (user) {
    username = user.username
    recipeData = await UserDataController.getViewedRecipes(username)
    console.log(recipeData)
    
  } else {
    username = null
  }
  res.render('home', { username, recipeData })
  
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

      res.render('meals', { mealsData, username })
  } catch (error) {
      console.error(error)
      res.status(500).send('Error fetching data from APIs.')
  }
})


app.get('/cocktails', async (req, res) => {
    try {
        const cocktailsResponse = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/search.php?s=martini', { timeout: 30000 })
        const cocktailsData = cocktailsResponse.data.drinks;

        
        res.render('cocktails', { cocktailsData, user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data from CocktailDB.');
    }
});

app.get('/instructions/:id', async (req, res) => {
  const recipeId = req.params.id
  const source = req.query.source
  let user = req.user
  let username
  if (user) {
    username = user.username
    UserDataController.updateViewedRecipes(username, recipeId, source)
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

    res.render('instructions', { recipe: recipeData, username });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching recipe details.');
  }
  });

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
});
