import { Admin, User } from '../models/User.js'; 
import Food from '../models/Food.js'
import UserData from '../controllers/UserDataController.js'

const updateUser = async (req, res) => {
  try {
      const { userId } = req.params;
      console.log(`user ${userId}`)
      const { username, role } = req.body;
      console.log(typeof req.body);
      console.log(username, role);
      const updatedUser = await User.findByIdAndUpdate(userId, { username, role }, { new: true });

      if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
      }
      const admin = await Admin.findById(req.adminId);
      if (admin) {
          admin.user_management_history.push({
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
};

const getUsers = async () => {
    try {
        const users = await User.find()
        let usersArray = []
        users.forEach(user => {
            usersArray.push(user.username)
        })
        return usersArray
    } catch(error) {
        console.log(`Error while getting users: ${error.message}`)
    }
}

const deleteUser = async (req, res) => {
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
          admin.user_management_history.push({
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
}
const deletePost = async (req, res) => {
    console.log("delete")
    try {
        const { foodId } = req.params;
        console.log(`post ${foodId}`)
     
        await Food.findByIdAndDelete(foodId);

        const users = await getUsers()

        users.forEach(user => {
            UserData.removeFavoriteRecipes(user, foodId)
            UserData.removeViewedRecipes(user, foodId)
        })
            
            
        
        let adminId = req.user.id
        const admin = await Admin.findById(adminId);
        if (admin) {
            admin.post_management_history.push({
                post: foodId,
                date: new Date(),
                method: "DELETE"
            });
            await admin.save();
        }
        console.log("Post deleted successfully")
        res.redirect('/')
        
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
        console.log(error.message)
    }
};

const updatePost = async (req, res) => {
    console.log("put");
    try {
        const foodId = req.params.id;
        console.log(`post ${foodId}`);

        let { name, descriptionEN, descriptionRU, original_img } = req.body;

        // Preserve existing image if no new file is uploaded
        let image = req.file ? `/uploads/${req.file.filename}` : original_img;

        console.log(typeof req.body);
        
        const updatedFood = await Food.findByIdAndUpdate(
            foodId,
            {
                name,
                descriptionRU,
                descriptionEN,
                image,
            },
            { new: true }
        );

        if (!updatedFood) {
            return res.status(404).json({ message: "Post not found" });
        }

        const admin = await Admin.findById(req.adminId);
        if (admin) {
            admin.post_management_history.push({
                post: updatedFood.id,
                date: new Date(),
                method: "UPDATE",
            });
            await admin.save();
        }

        res.redirect(`/posts/en/${foodId}`)
    } catch (error) {
        res.status(500).json({ message: "Error updating post", error: error.message });
    }
};



export { updateUser, deleteUser, deletePost, updatePost };
