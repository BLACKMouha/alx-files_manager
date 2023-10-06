/* eslint-disable consistent-return */
const sha1 = require('sha1');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const requestData = req.body;
    const { email, password } = requestData;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const users = await dbClient.usersCollection();
    const aUser = await users.findOne({ email });
    if (aUser) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }

    const hashedPassword = sha1(password);
    const newUser = { email, password: hashedPassword };
    const result = await users.insertOne(newUser);
    const id = result.ops[0]._id;
    res.status(201).json({ id, email });
  }
}

export default UsersController;
module.exports = UsersController;
