import { createRequire } from 'module'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import axios from 'axios'
import AuthController from './controllers/AuthController.js'
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


app.get('/', (req,res)=>{
  let user = req.user.username
  res.render('home', { user })
})


app.get('/weather', async (req, res) => {
    let user = req.user.username
    const city =req.query.city
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
        let user = req.user.username
        res.render('weather',{weatherData,p,lat,lon,user})
    } catch (error) {
        console.error(error);
        res.status(500).render('error');
    }
    }
    else {
      res.render('weather_search', { user })
    }
    
});

app.get('/meals', async (req, res) => {
  let user = req.user.username
    try {
        const mealsResponse = await axios.get('https://www.themealdb.com/api/json/v1/1/search.php?s=')
        const mealsData = mealsResponse.data.meals

        res.render('meals', { mealsData, user })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error fetching data from APIs.')
    }
})

app.post('/meals', async (req, res) => {
  const query = req.body.query
  try {
    const mealsResponse = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
    const mealsData = mealsResponse.data.meals
    res.render('meals', { mealsData })
  }
  catch (error) {
    console.error(error)
    res.status(500).send('Error fetching data from APIs.')
  }
})

app.get('/cocktails', async (req, res) => {
    let user = req.user.username
    try {
        const cocktailsResponse = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/search.php?s=martini')
        const cocktailsData = cocktailsResponse.data.drinks;

        
        res.render('cocktails', { cocktailsData, user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data from CocktailDB.');
    }
});

app.get('/instructions/:id', async (req, res) => {
    const recipeId = req.params.id;
    const source = req.query.source;
    let user = req.user.username
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
  
      res.render('instructions', { recipe: recipeData, user });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching recipe details.');
    }
  });

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
});
