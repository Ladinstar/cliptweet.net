import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { logger } from './logger.js';

// Short server-selection timeout so /health degrades fast (instead of hanging
// ~30s) when MongoDB is unreachable — orchestrators rely on a snappy probe.
const client = new MongoClient(config.mongo.uri, {
  serverSelectionTimeoutMS: config.mongo.serverSelectionTimeoutMs,
});

const collections = {
  downloads: null,
  errors: null,
  adminUsers: null,
};

export async function connectDb() {
  await client.connect();
  const db = client.db(config.mongo.dbName);

  collections.downloads = db.collection('downloads');
  collections.errors = db.collection('errors');
  collections.adminUsers = db.collection('admin_users');

  await Promise.all([
    collections.downloads.createIndex({ timestamp: -1 }),
    collections.downloads.createIndex({ format: 1 }),
    collections.downloads.createIndex({ quality: 1 }),
    collections.errors.createIndex({ timestamp: -1 }),
    collections.adminUsers.createIndex({ username: 1 }, { unique: true }),
  ]);

  await seedAdminUser();
  logger.info('MongoDB connected and indexes ensured');
}

async function seedAdminUser() {
  const existing = await collections.adminUsers.findOne({ username: config.admin.username });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(config.admin.password, 10);
    await collections.adminUsers.insertOne({
      username: config.admin.username,
      password: hashedPassword,
      createdAt: new Date(),
    });
    logger.info({ username: config.admin.username }, 'Default admin user created');
  }
}

export async function pingDb() {
  await client.db(config.mongo.dbName).command({ ping: 1 });
}

export async function closeDb() {
  await client.close();
}

export function getCollections() {
  if (!collections.downloads) {
    throw new Error('Database not initialized. Call connectDb() first.');
  }
  return collections;
}
