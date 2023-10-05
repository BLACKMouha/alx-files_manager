/* eslint-disable consistent-return */
const sha1 = require('sha1');
const dbClient = require('../utils/db');

const postNew = (req, res) => {
  if (dbClient.isAlive()) {
    const requestData = req.body;
    const { email, password } = requestData;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const database = dbClient.client.db(process.env.DB_DATABASE || 'files_manager');

    const usersCollection = database.collection('users');

    const findingUser = usersCollection.findOne({ email });
    findingUser
      .then((a) => {
        if (a) {
          res.status(400).json({ error: 'Already exist' });
        } else {
          const hashedPassword = sha1(password);
          const newUser = { email, password: hashedPassword };

          const r = usersCollection.insertOne(newUser);
          r
            .then((a) => a.ops[0])
            .then((g) => {
              res.status(201).json({ id: g._id, email });
            })
            .catch((e) => res.status(400).json({ error: e.toString() }));
        }
      })
      .catch((e) => res.status(500).json({ error: e.toString() }));
  }
};

export default postNew;
