const { ObjectId } = require('mongodb');
const uuidv4 = require('uuid').v4;
const fs = require('fs');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class FilesController {
  static async postUpload(req, res) {
    try {
      const xTokenHeader = req.headers['x-token'];
      if (!xTokenHeader) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const key = `auth_${xTokenHeader}`;
      const aUserId = await redisClient.get(key);
      if (!aUserId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const users = await dbClient.usersCollection();
      const aUser = await users.findOne({ _id: ObjectId(aUserId) });
      if (!aUser) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH, { recursive: true });
      }
      const filesProps = req.body;
      const { name, type, data } = filesProps;
      let { parentId, isPublic } = filesProps;

      if (!name) {
        res.status(400).json({ error: 'Missing name' });
        return;
      }
      if (!type || !(['folder', 'file', 'image'].includes(type))) {
        res.status(400).json({ error: 'Missing type' });
        return;
      }
      if (!data && type !== 'folder') {
        res.status(400).json({ error: 'Missing data' });
        return;
      }

      if (isPublic === undefined) {
        isPublic = false;
      }
      if (parentId === undefined) {
        parentId = 0;
      }

      const files = await dbClient.filesCollection();

      fs.mkdirSync(FOLDER_PATH, { recursive: true });

      if (parentId === 0) {
        if (type === 'folder') {
          fs.mkdir(`${FOLDER_PATH}/${name}`, { recursive: true }, (err) => {
            if (err) throw err;
          });
          const newFolderCreation = await files.insertOne({
            userId: ObjectId(aUserId),
            name,
            type,
            isPublic,
            parentId: parentId.toString(),
          });
          const newFolder = newFolderCreation.ops[0];
          res.status(201).json({
            id: newFolder._id,
            userId: newFolder.userId,
            name: newFolder.name,
            type: newFolder.type,
            isPublic: newFolder.isPublic,
            parentId: newFolder.parentId,
          });
          return;
        }
        const filename = uuidv4();
        const buffer = Buffer.from(data || '', 'base64').toString('utf-8');
        fs.writeFile(`${FOLDER_PATH}/${filename}`, buffer, (err) => {
          if (err) throw err;
        });
        const newFileCreation = await files.insertOne({
          userId: ObjectId(aUserId),
          name,
          type,
          isPublic,
          parentId,
        });
        const newFile = newFileCreation.ops[0];
        res.status(201).json({
          id: newFile._id,
          userId: aUserId,
          name: newFile.name,
          type: newFile.type,
          isPublic: newFile.isPublic,
          parentId: newFile.parentId,
          localPath: `${FOLDER_PATH}/${filename}`,
        });
        return;
      }
      const parentFolder = await files.findOne({ _id: ObjectId(parentId) });
      if (!parentFolder) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (parentFolder.type !== 'folder') {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
      if (type === 'folder') {
        fs.mkdir(`${FOLDER_PATH}/${parentFolder.name}/${name}`, { recursive: true }, (err) => {
          if (err) throw err;
        });
        const newFolderCreation = await files.insertOne({
          userId: ObjectId(aUserId),
          name,
          type,
          isPublic,
          parentId: parentId.toString(),
          localPath: `${FOLDER_PATH}/${parentFolder.name}/${name}`,
        });
        const newFolder = newFolderCreation.ops[0];
        res.status(201).json({
          id: newFolder._id,
          userId: newFolder.userId,
          name: newFolder.name,
          type: newFolder.type,
          isPublic: newFolder.isPublic,
          parentId: newFolder.parentId,
          localPath: `${FOLDER_PATH}/${parentFolder.name}/${name}`,
        });
        return;
      }
      const filename = uuidv4();
      const buffer = Buffer.from(data || '', 'base64').toString('utf-8');
      fs.writeFile(`${FOLDER_PATH}/${parentFolder.name}/${filename}`, buffer, (err) => {
        if (err) {
          res.status(400).json({ error: err.message });
          throw err;
        }
      });
      const newFileCreation = await files.insertOne({
        userId: aUserId,
        name,
        isPublic,
        parentId,
        localPath: `${FOLDER_PATH}/${parentFolder.name}/${filename}`,
      });

      const newFile = newFileCreation.ops[0];
      res.status(201).json({
        id: newFile._id,
        userId: aUserId,
        name,
        isPublic,
        parentId,
      });
      return;
    } catch (e) {
      res.status(500).json({ error: e.toString() });
      throw e;
    }
  }
}

module.exports = FilesController;
