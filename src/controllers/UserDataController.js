import User from '../models/User.js';
import UserData from '../models/UserData.js';
import axios from 'axios'

class UserDataController {
    async createUserData(username) {
      const candidate = await UserData.findOne({ username });
      if (!candidate) {
        const userData = new UserData({username})
        await userData.save()
        console.log(`User ${username} successfully added!`)
      } 
    }

    async updateSearchHistory(username, query, queryReceiver) {
      try {
        await this.createUserData(username)
        const userData = await UserData.findOne({ username })
        let searchHistory = userData.searchHistory ? userData.searchHistory : []
        searchHistory.push({ queryReceiver: queryReceiver,  query: query})
        await UserData.updateOne({ username: username }, { $set: { searchHistory: searchHistory } })
        console.log("Updating search history succeeded.")
        console.log(searchHistory)
      } catch (err) {
        console.error("Updating search history failed.", err)
      }
    }

    async updateViewedRecipes(username, recipeId, type) {
      try {
        await this.createUserData(username)
        const userData = await UserData.findOne({ username })
        let viewedRecipes = userData.viewedRecipes ? userData.viewedRecipes : []
        viewedRecipes.push({ recipeId: recipeId, type: type } )
        await UserData.updateOne({ username: username }, { $set: { viewedRecipes: viewedRecipes } })
        console.log("Updating viewed recipes succeeded.")
        console.log(viewedRecipes)
      } catch (err) {
        console.error("Updating viewed recipes failed.", err)
      }
    }

    async getViewedRecipes(username) {
      try {
        await this.createUserData(username)
        const userData = await UserData.findOne({ username })
        let viewedRecipes = userData.viewedRecipes ? userData.viewedRecipes : []
        let recipes = []
        let apiUrl;
        for (const recipe of viewedRecipes) {
          let recipeId = recipe.recipeId
          let source = recipe.type
          if (source === 'meals') {
            apiUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
          } else if (source === 'cocktails') {
            apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
          } else {
            return res.status(400).send('Invalid source.');
          }
          const response = await axios.get(apiUrl);
          const recipeData = source === 'meals' ? response.data.meals[0] : response.data.drinks[0];
          recipes.push(recipeData)
        }
        
        console.log("Viewed history successfully retrieved.")
        return recipes
      } catch (err) {
        console.error("Failed to retreive view history.", err)
      }
    }

}

export default new UserDataController();
