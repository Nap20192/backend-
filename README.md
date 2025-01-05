# Meal and Weather Information App

This application provides weather information based on your location, a random meal recipe, and a photo related to the weather. It uses several APIs, including OpenWeatherMap, Unsplash, and ThemealDB to retrieve and display the information.

## Features

- **Weather Information**: Retrieve the weather for a specified city using the OpenWeatherMap API.
- **Meal Recipe**: Display a random meal recipe from ThemealDB API.
- **Unsplash Photo**: Fetch a photo related to the weather for the specified city using the Unsplash API.

## Technologies Used

- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js used to handle routes and server requests.
- **Axios**: A promise-based HTTP client to fetch data from APIs.
- **ThemealDB API**: A free API that provides information about meals, including random meals and specific meal recipes.
- **OpenWeatherMap API**: Provides current weather data for cities around the world.
- **Unsplash API**: Allows you to search and fetch images based on certain keywords, such as weather-related themes.
- **EJS (Embedded JavaScript Templates)**: A simple templating engine for rendering dynamic content in the HTML views.
- **Node.js**: A JavaScript runtime that helps you build scalable network applications.

## Requirements

- **Node.js** installed on your system (download it [here](https://nodejs.org/)).
- A **package manager** like npm.

## Setup

1. **Clone the repository** to your local machine:

    ```bash
    git clone https://github.com/your-repo/meal-weather-app.git
    ```

2. **Navigate to the project folder**:

    ```bash
    cd meal-weather-app
    ```

3. **Install dependencies**:

    Run this command to install all required dependencies:

    ```bash
    npm install
    ```

4. **Create a `.env` file**:

    In the root directory, create a `.env` file containing your API keys. Ensure to replace with your own API keys.

    - **OpenWeatherMap API Key** (`OPENWEATHER_API_KEY`)
    - **Unsplash API Key** (`UNSPLASH_API_KEY`)

    Example `.env`:

    ```
    OPENWEATHER_API_KEY=your_openweathermap_api_key
    UNSPLASH_API_KEY=your_unsplash_api_key
    ```

## Running the App

To start the app:

1. In your project directory, run the following:

    ```bash
    npm start
    ```

2. This will start a local server at `http://localhost:3000`.

3. Open a browser and navigate to `http://localhost:3000`.

## Usage

### View the Weather
- When you visit the main page, you will be prompted to enter the name of a city.
- The app will fetch and display the current weather using **OpenWeatherMap**.
- A related photo from **Unsplash** will be displayed alongside the weather data.

### Random Meal Recipe
- Clicking on the "Meals" link will display a random meal fetched from the **ThemealDB** API.
- Ingredients and recipe instructions will be listed with images where applicable.

## Files and Structure

### `app.js` (Main Server File)

Contains all routes and logic for interacting with the APIs, handling requests, and serving views.

### `views/` (EJS Templates)
- **`index.ejs`**: Main page where users can input a city to get weather details.
- **`weather.ejs`**: Displays weather information and a photo related to the city.
- **`meals.ejs`**: Displays a random meal and ingredients.
  
### `public/` (Static Files)
Contains the CSS, JS, and image files to serve on the front end.

## Notes

1. **API Limits**: Make sure to keep an eye on your API quotas to avoid hitting the limits for OpenWeatherMap, Unsplash, and any other APIs that require keys.
   
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Helpful Links:
- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [Unsplash API Docs](https://unsplash.com/documentation)
- [ThemealDB API Docs](https://www.themealdb.com/api.php)
