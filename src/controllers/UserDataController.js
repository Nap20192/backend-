import UserData from '../models/UserData.js';
import axios from 'axios'
import User from '../models/User.js';
import Food from '../models/Food.js';

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
        searchHistory.unshift({ queryReceiver: queryReceiver,  query: query})
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
        if (viewedRecipes.some((recipe) => recipe.recipeId === recipeId)) {
          let recipeIndex = viewedRecipes.findIndex((recipe) => recipe.recipeId === recipeId)
          viewedRecipes.splice(recipeIndex, 1)
        } 
        viewedRecipes.unshift({ recipeId: recipeId, type: type } )
        await UserData.updateOne({ username: username }, { $set: { viewedRecipes: viewedRecipes } })
        console.log("Updating viewed recipes succeeded.")
        console.log(viewedRecipes)
      } catch (err) {
        console.error("Updating viewed recipes failed.", err)
      }
    }

    async updateFavoriteRecipes(username, recipeId, type) {
      try {
        await this.createUserData(username)
        const userData = await UserData.findOne({ username })
        let favorites = userData.favorites ? userData.favorites : []
        if (favorites.some((recipe) => recipe.recipeId === recipeId)) {
          let recipeIndex = favorites.findIndex((recipe) => recipe.recipeId === recipeId)
          favorites.splice(recipeIndex, 1)
        } 
        favorites.unshift({ recipeId: recipeId, type: type } )
        await UserData.updateOne({ username: username }, { $set: { favorites: favorites } })
        console.log("Updating favorite recipes succeeded.")
        console.log(favorites)
      } catch (err) {
        console.error("Updating favorite recipes failed.", err)
      }
    }

    async removeFavoriteRecipes(username, recipeId) {
      try {
        const userData = await UserData.findOne({ username })
        let favorites = userData.favorites ? userData.favorites : []
        if (favorites.some((recipe) => recipe.recipeId === recipeId)) {
          let recipeIndex = favorites.findIndex((recipe) => recipe.recipeId === recipeId)
          favorites.splice(recipeIndex, 1)
        } 
        await UserData.updateOne({ username: username }, { $set: { favorites: favorites } })
        console.log("Removing favorite recipes succeeded.")
        console.log(favorites)
      } catch (err) {
        console.error("Removing favorite recipes failed.", err)
      }
    }

    async getUserRecipeDataFromAPI(array) {
      try {
        let recipes = []
        let apiUrl;
        for (const recipe of array.slice(0, 3)) {
          let recipeId = recipe.recipeId
          let source = recipe.type
          if (source === 'meals') {
            apiUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
          } else if (source === 'beer') {
            apiUrl = `https://punkapi.online/v3/beers/${recipeId}`;
          } else {
            continue
          }
          const response = await axios.get(apiUrl);
          const recipeData = source === 'meals' ? response.data.meals[0] : response.data;
          recipes.push(recipeData)
        }
        
        console.log("Data successfully retrieved from API.")
        return recipes
      } catch (err) {
        console.error("Failed to retreive data from API.", err)
      }
    }

    async getViewedRecipes(username) {
      try {
        await this.createUserData(username)
        const userData = await UserData.findOne({ username })
        let viewedRecipes = userData.viewedRecipes ? userData.viewedRecipes : []
        let recipes = this.getUserRecipeDataFromAPI(viewedRecipes)
        
        console.log("Viewed history successfully retrieved.")
        return recipes
      } catch (err) {
        console.error("Failed to retreive view history.", err)
      }
    }

    async getFavoriteRecipes(username) {
      try {
        await this.createUserData(username)
        const userData = await UserData.findOne({ username })
        let favorites = userData.favorites ? userData.favorites : []
        let recipes = this.getUserRecipeDataFromAPI(favorites)

        console.log("Favorites successfully retrieved.")
        return recipes
      } catch (err) {
        console.error("Failed to retreive favorites.", err)
      }
    }

    async checkFavoriteRecipe(username, recipeId) {
      await this.createUserData(username)
      const userData = await UserData.findOne({ username })
      if (userData.favorites.some((recipe) => recipe.recipeId === recipeId)) {
        return true
      } else {
        return false
      }
    }
    async getcreatedRecipes(username) {
      try {
        const food = await Food.find({ authorName:username })
        console.log("Created recipes successfully retrieved.")
        return food
      } catch (err) {
        console.error("Failed to retreive created recipes.", err)
      }
    }

}

export default new UserDataController();
