import { Admin, User } from '../models/User.js'; 

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
};

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
};

export { updateUser, deleteUser };
