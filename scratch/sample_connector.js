const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb+srv://postpipe:W1u0eiXtDUPFqfYo@postpipe.9m5fehm.mongodb.net/postpipe?appName=postpipe';

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('postpipe_core');
    const connector = await db.collection('user_connectors').findOne();
    console.log('Sample Connector:', JSON.stringify(connector, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
