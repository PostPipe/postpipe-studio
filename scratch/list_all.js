const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb+srv://postpipe:W1u0eiXtDUPFqfYo@postpipe.9m5fehm.mongodb.net/postpipe?appName=postpipe';

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    console.log('Databases:', dbs.databases.map(d => d.name));

    for (const dbInfo of dbs.databases) {
        const db = client.db(dbInfo.name);
        const cols = await db.listCollections().toArray();
        console.log(`Collections in ${dbInfo.name}:`, cols.map(c => c.name));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
