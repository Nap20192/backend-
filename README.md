# Meal and Weather Information App

This application provides weather information based on your location, meal recipes, and a photo related to the weather, beer information. It uses several APIs, including OpenWeatherMap, Unsplash, and ThemealDB, Punk API to retrieve and display the information.

## Users for testing the App
#### Admins
- username: Rakhat Lucum   password: lucum
- username: Nikolay Kogay  password: kogay2005

#### Non-admins
- username: frieren   password: frieren

## Features

- **Weather Information**: Retrieve the weather for a specified city using the OpenWeatherMap API.
- **Meal Recipe**: Display a random meal recipe from ThemealDB API.
- **Unsplash Photo**: Fetch a photo related to the weather for the specified city using the Unsplash API.

## Technologies Used

- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js used to handle routes and server requests.
- **Axios**: A promise-based HTTP client to fetch data from APIs.
- **ThemealDB API**: A free API that provides information about meals, including random meals and specific meal recipes.
- **Punk API**: A free API that provides information about beer.
- **Mongoose**: An package that allows working with MongoDB.
- **MongoDB**: A NoSQL database that stores data in flexible, JSON-like documents.
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

### Meal Recipe
- Clicking on the "Meals" link will display meals fetched from the **ThemealDB API** .
- Ingredients and recipe instructions will be listed with images where applicable.

### Beer Informtion
- Clicking on the "Meals" link will display beer fetched from the **Punk API**.
- Ingredients and recipe instructions will be listed with images where applicable.

### Account creation and login
- Clicking the login button will allow you to log into an existing account.
- Clicking the singup button will allow you to create a new account.

### Personalized data
- As you browse the website, the meals and beer you open are saved in your view history and displayed on the home page.
- You can save meals and beer as a favorite by pressing the heart on the meals' or beer's page. Favorites are displayed on the home page. Pressing the heart again will remove the item from favorites.

### Admin panel
- Admins can access a secret page on /admin that allows them to vew and manage all existing non-admin users. The admin can change their username, their rank or delete them.


## Files and Structure

### `index.js` (Main Server File)

Contains all routes and logic for interacting with the APIs, handling requests, and serving views.

### `views/` (EJS Templates)

Contains all ejs templates.
  
### `public/` (Static Files)
Contains the CSS, JS, and image files to serve on the front end.

### 'src/' (Source Code)
Contains all scripts, including the **index.js** main server file; 'src/controllers' folder, which contains 'AuthController.js' responsible for handling user authentication, and 'UserDataController.js' responsible for handling user data like view history, search history and favorites; 'src/middleware' folder, which contains 'AuthMiddleware.js' responsible for authenthicating the user using cookies and the jwt token; 'src/models', which contains collection schemas for MongoDB.

## Notes

1. **API Limits**: Make sure to keep an eye on your API quotas to avoid hitting the limits for OpenWeatherMap, Unsplash, and any other APIs that require keys.
   
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Helpful Links:
- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [Unsplash API Docs](https://unsplash.com/documentation)
- [ThemealDB API Docs](https://www.themealdb.com/api.php)
