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
import { updateUser, deleteUser } from './controllers/AdminController.js'
import translate from 'translate-google'
import FoodController from './controllers/FoodController.js'

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

let pageMain = {
  beerNav: "Beer",
  mealsNav: "Meals",
  weatherNav: "Weather",
  logoutBtn: "Log Out",
  loginBtn: "Log In",
  searchHeader: "Find Recipe",
  infoBtn: "View More",
  singupBtn: "Sign up",
  langBtn: "Language",
  lang: "en"
};


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
  let createdData
  let page = {...pageMain}
  if (user) {
    username = user.username
    recipeData = await UserDataController.getViewedRecipes(username)
    
    favoriteData = await UserDataController.getFavoriteRecipes(username)

    let response = await axios.get(`http://localhost:3000/food`)
    console.log(response)
    createdData = response.data
    console.log(createdData)
  } else {
    username = null
  }
  res.render('home', { username, recipeData, favoriteData, createdData, page })
  
})


app.get('/:lang(en|ru)', async (req,res)=>{
  let user = req.user
  let username
  let recipeData
  let favoriteData
  let createdData
  let page = {...pageMain}
  const lang = req.params.lang
  if (user) {
    username = user.username
    recipeData = await UserDataController.getViewedRecipes(username)
    
    favoriteData = await UserDataController.getFavoriteRecipes(username)

    let response = await axios.get(`http://localhost:3000/food`)
    createdData = response.data
    if (lang !== "en") {
      page.lang = lang
    }
    
    console.log(createdData)
  } else {
    username = null
  }
  res.render('home', { username, recipeData, favoriteData, createdData, page })
  
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

app.get('/meals/:lang', async (req, res) => {
  const lang = req.params.lang
  const query = req.query.query ? req.query.query : ''
  const queryReceiver = 'https://www.themealdb.com/api/json/v1/1/search.php?s='
  let user = req.user
  let username
  let page = { ...pageMain }
  page.mainHeader = "Meals"
  page.lang = lang

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

      if (lang != "en") {
        console.log("Translating...")
        for (let i = 0; i < mealsData.length; i++) {
          const { strMeal, strInstructions } = mealsData[i]
          mealsData[i].strMeal = await translate(strMeal.substring(0, 100), {from: 'en', to: lang})
          mealsData[i].strInstructions = await translate(strInstructions.substring(0, 100), {from: 'en', to: lang})
        }
        page = await translate(page, {from: 'en', to: lang })
        page.loginBtn = "Войти"
        page.logoutBtn = "Выйти"  
        page.infoBtn = "Узнать больше"
      }
      
      page.lang = lang
      if (mealsData) {
        res.render('meals', { mealsData, username, page })
      } else {
        res.render('meals', { mealsData, username, page })
      }
  } catch (error) {
      console.error(error)
      res.status(500).send('Error fetching data from APIs.')
  }
})

app.get('/meals', async (req, res) => {
  const query = req.query.query ? req.query.query : ''
  const queryReceiver = 'https://www.themealdb.com/api/json/v1/1/search.php?s='
  let user = req.user
  let username
  let page = { ...pageMain }
  page.mainHeader = "Meals"

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
        res.render('meals', { mealsData, username, page })
      } else {
        res.render('meals', { mealsData, username, page })
      }
  } catch (error) {
      console.error(error)
      res.status(500).send('Error fetching data from APIs.')
  }
})


app.get('/beer/:lang', async (req, res) => {
  const lang = req.params.lang
  const query = req.query.query ? req.query.query : '';
  const queryReceiver = 'https://punkapi.online/v3/beers/';
  let user = req.user;
  let username = user ? user.username : null;
  let beerResponse
  let page = { ...pageMain }
  page.mainHeader = "Beer"
  if (user) {
      UserDataController.updateSearchHistory(username, queryReceiver, query);
  }
  
  

  try {
    if (query) {
      beerResponse = await axios.get(`https://punkapi.online/v3/beers?beer_name=${query}`)
    } else {
      beerResponse = await axios.get('https://punkapi.online/v3/beers?page=1')
    }
      

      const beerData = beerResponse.data; 
      if (lang != "en") {
        for (let i = 0; i < beerData.length; i++) {
          const { name, tagline, description, first_brewed } = beerData[i]
          beerData[i].name = await translate(name.substring(0, 100), {from: 'en', to: lang})
          beerData[i].tagline = await translate(tagline.substring(0, 100), {from: 'en', to: lang})
          beerData[i].description = await translate(description.substring(0, 100), {from: 'en', to: lang})
          beerData[i].first_brewed = await translate(first_brewed.substring(0, 100), {from: 'en', to: lang})
        }
        page = await translate(page, {from: 'en', to: lang })
        page.loginBtn = "Войти"
        page.logoutBtn = "Выйти"  
        page.infoBtn = "Узнать больше"
      }
      page.lang = lang
      console.log(beerData)
      res.render('beer', { beerData, username, page });

  } catch (error) {
      console.error("Error fetching data from API:", error.message);
      res.status(500).send('Error fetching data from APIs.');
  }
});

app.get('/beer', async (req, res) => {
  const query = req.query.query ? req.query.query : '';
  const queryReceiver = 'https://punkapi.online/v3/beers/';
  let user = req.user;
  let username = user ? user.username : null;
  let beerResponse
  let page = { ...pageMain }
  page.mainHeader = "Beer"
  if (user) {
      UserDataController.updateSearchHistory(username, queryReceiver, query);
  }
  
  

  try {
    if (query) {
      beerResponse = await axios.get(`https://punkapi.online/v3/beers?beer_name=${query}`)
    } else {
      beerResponse = await axios.get('https://punkapi.online/v3/beers?page=1')
    }
      

      const beerData = beerResponse.data; 
      console.log(beerData)
      res.render('beer', { beerData, username, page });

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


app.put('/admin/:userId', updateUser);

app.delete('/admin/:userId',deleteUser);

app.get('/instructions/:id/:lang', async (req, res) => {
  const recipeId = req.params.id
  const lang = req.params.lang
  const source = req.query.source
  let isFavorite = false
  let user = req.user
  let page = { ...pageMain }
  page.infoBtn = "View full recipe"
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
    } else if (source === 'beer') {
      apiUrl = `https://punkapi.online/v3/beers/${recipeId}`;
    } else {
      return res.status(400).send('Invalid source.');
    }

    const response = await axios.get(apiUrl);
    let recipeData = source === 'meals' ? response.data.meals[0] : response.data;

    if (lang != "en") {
      for (let i = 0; i < beerData.length; i++) {
        const { name, tagline, description, first_brewed } = beerData[i]
        recipeData = await translate(recipeData, {from: 'en', to: lang})
      }
      page = await translate(page, {from: 'en', to: lang })
      page.loginBtn = "Войти"
      page.logoutBtn = "Выйти"  
      page.infoBtn = "Посмотреть весь рецепт"
    }
    page.lang = lang

    res.render('instructions', { recipe: recipeData, username, isFavorite, recipeId, source, page });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching recipe details.');
  }
});


app.get('/instructions/:id', async (req, res) => {
  const recipeId = req.params.id
  const lang = req.params.lang
  const source = req.query.source
  let isFavorite = false
  let user = req.user
  let page = { ...pageMain }
  page.infoBtn = "View full recipe"
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
    } else if (source === 'beer') {
      apiUrl = `https://punkapi.online/v3/beers/${recipeId}`;
    } else {
      return res.status(400).send('Invalid source.');
    }

    const response = await axios.get(apiUrl);
    let recipeData = source === 'meals' ? response.data.meals[0] : response.data;

    

    res.render('instructions', { recipe: recipeData, username, isFavorite, recipeId, source, page });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching recipe details.');
  }
});

app.get('/food', FoodController.getAllFood);
app.get('/food/:id', FoodController.getFoodById);
app.post('/food', FoodController.createFood);
app.put('/food/:id', FoodController.updateFood);
app.delete('/food/:id', FoodController.deleteFood);
app.get('/createPost', async (req, res) => {
  const username = req.user.username
  res.render('food', {username})
})

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
});
