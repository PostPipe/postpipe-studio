import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function createTTLIndex() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found');
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const dbName = process.env.MONGODB_DB_NAME || 'postpipe';
    const db = client.db(dbName);
    
    console.log('Creating TTL index on canvases.lastActivity in database:', dbName);
    
    // Create TTL index: expire after 30 days (30 * 24 * 60 * 60 seconds)
    const result = await db.collection('canvases').createIndex(
      { lastActivity: 1 },
      { expireAfterSeconds: 30 * 24 * 60 * 60 }
    );

    console.log('Index created:', result);

  } catch (err) {
    console.error('Error creating TTL index:', err);
  } finally {
    await client.close();
  }
}

createTTLIndex();
