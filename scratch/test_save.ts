import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testSave() {
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
    
    console.log('Testing save in database:', dbName);
    
    const result = await db.collection('canvases').updateOne(
      { userId: 'test-user', name: 'Test Project' },
      { 
        $set: { 
          nodes: [], 
          edges: [], 
          updatedAt: new Date() 
        },
        $setOnInsert: { 
          userId: 'test-user', 
          name: 'Test Project', 
          createdAt: new Date() 
        }
      },
      { upsert: true }
    );

    console.log('Save result:', result);
    
    const collections = await db.listCollections().toArray();
    console.log('Collections in', dbName, ':', collections.map(c => c.name));

  } catch (err) {
    console.error('Error during test save:', err);
  } finally {
    await client.close();
  }
}

testSave();
