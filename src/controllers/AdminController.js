import { Admin, User } from '../models/userModel.js'; // Adjust the import path as needed

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

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
    try {
        const { userId } = req.params;

        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ message: "User not found" });
        }
        await User.findByIdAndDelete(userId);
        const admin = await Admin.findById(req.adminId);
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
