const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

export const getStatus = (req, res) => {
  res.status(200).json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
};

export const getStats = (req, res) => {
  if (dbClient.isAlive()) {
    Promise.all([dbClient.nbUsers(), dbClient.nbFiles()])
      .then(([uCount, fCount]) => res.status(200).send({ users: uCount, files: fCount }));
  }
};
