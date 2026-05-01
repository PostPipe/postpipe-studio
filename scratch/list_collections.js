const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb+srv://postpipe:W1u0eiXtDUPFqfYo@postpipe.9m5fehm.mongodb.net/postpipe?appName=postpipe';
  const studioDbName = 'postpipe_studio';

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
