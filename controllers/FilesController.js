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
      if (!parentId) {
        parentId = 0;
      }
      const files = await dbClient.filesCollection();
      if (parentId !== 0) {
        const parentFolder = await files.findOne({ parentId });
        if (!parentFolder) {
          res.status(400).json({ error: 'Parent not found' });
          return;
        }
        if (parentFolder.type !== 'folder') {
          res.status(400).json({ error: 'Parent is not a folder' });
          return;
        }
      }
      if (isPublic === undefined) {
        isPublic = false;
      }
      if (type === 'folder') {
        const createFolderResult = await files.insertOne({
          userId: ObjectId(aUserId),
          name,
          type,
          isPublic,
          parentId,
        });
        const newFolder = createFolderResult.ops[0];
        res.status(201).json({
          id: newFolder._id,
          name: newFolder.name,
          type: newFolder.type,
          isPublic: newFolder.isPublic,
          parentId: newFolder.parentId,
        });
        return;
      }
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      const fileName = uuidv4();
      const filePath = `${folderPath}/${fileName}`;
      fs.writeFile(filePath, Buffer.from(data, 'base64').toString('utf8'), (err) => {
        if (err) {
          res.status(400).json({ error: err.message });
        }
      });
      const result = await files.insertOne({
        userId: ObjectId(aUserId),
        name,
        type,
        isPublic,
        parentId,
        localPath: filePath,
      });
      const newFile = result.ops[0];
      console.log(newFile);
      res.status(201).json({
        id: newFile._id,
        userId: newFile.userId,
        name: newFile.name,
        type: newFile.type,
        isPublic: newFile.isPublic,
        parentId: newFile.parentId,
      });
    } catch (e) {
      res.status(500).json({ error: e.toString() });
      throw e;
    }
  }
}

module.exports = FilesController;
