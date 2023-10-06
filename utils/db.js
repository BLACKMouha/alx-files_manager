const sha1 = require('sha1');
const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  async usersCollection() {
    return this.client.db().collection('users');
  }

  async filesCollection() {
    return this.client.db().collection('files');
  }

  async addUser(email, password) {
    try {
      if (!email) return new Error('Missing email');
      if (!password) return new Error('Missing password');

      const users = await this.usersCollection();
      const aUser = await users.findOne({ email });
      if (aUser) return new Error('Already exist');

      const hashedPassword = sha1(password);
      const newUser = { email, password: hashedPassword };
      const result = await users.insertOne(newUser);
      const id = result.ops[0]._id;
      return { id, email };
    } catch (e) {
      return e.toString();
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
