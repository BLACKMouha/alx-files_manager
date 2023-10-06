/* eslint-disable consistent-return */
const sha1 = require('sha1');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    try {
      const requestData = req.body;
      const { email, password } = requestData;
      if (!email) return res.status(400).json({ error: 'Missing email' });
      if (!password) return res.status(400).json({ error: 'Missing password' });
      const users = await dbClient.usersCollection();
      const aUser = await users.findOne({ email });
      if (aUser) return res.status(400).json({ error: 'Already exist' });

      const hashedPassword = sha1(password);
      const newUser = { email, password: hashedPassword };
      const result = await users.insertOne(newUser);
      const id = result.ops[0]._id;
      return res.status(201).json({ id, email });
    } catch (e) {
      return res.status(500).json({ error: e.toString() });
    }
  }
}

module.exports = UsersController;
