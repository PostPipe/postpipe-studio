import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found');
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Check main DB from URI
    const db = client.db();
    console.log('Using database:', db.databaseName);
    const collections = await db.listCollections().toArray();
    console.log('Collections in', db.databaseName, ':', collections.map(c => c.name));

    // Check studio DB if different
    const studioDbName = process.env.MONGODB_DB_NAME;
    if (studioDbName && studioDbName !== db.databaseName) {
        const studioDb = client.db(studioDbName);
        const studioCols = await studioDb.listCollections().toArray();
        console.log('Collections in', studioDbName, ':', studioCols.map(c => c.name));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
