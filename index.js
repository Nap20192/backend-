import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import axios from 'axios'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, '../public')))
app.set('view engine', 'ejs')
app.set('views', path.join('./public/templates'))


const API_KEY = '1d6dc3890cf79b7449306bced111270d';
app.get('/', (req,res)=>{
    res.render('index')
})

app.post('/weather', async (req, res) => {
    const city =req.body.city; 
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
    try {
        const response = await axios.get(url);
        const weatherData = response.data;
        res.render('weather',{weatherData,
            "lat":weatherData.lon,
            log:weatherData.log
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при получении данных от OpenWeatherAPI.');
    }
});


const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
});
