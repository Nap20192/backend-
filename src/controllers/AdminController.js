class AdminController {
  async deleteUser(req, res) {
    try {
      const username = req.body
      await username.deleteOne({username})
    } catch {

    }
  }
}