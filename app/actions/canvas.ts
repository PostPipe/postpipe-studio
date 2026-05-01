'use server';

import clientPromise from '@/lib/mongodb';

export async function checkUserCanvases(userId: string) {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB_NAME || 'postpipe';
    const db = client.db(dbName);
    
    // Check for both common field names for user association
    const canvases = await db.collection('canvases').find({ 
      $or: [{ userId: userId }, { ownerId: userId }, { createdBy: userId }] 
    }).limit(1).toArray();
    
    return {
      hasCanvases: canvases.length > 0,
    };
  } catch (error) {
    console.error('Error checking canvases:', error);
    return { hasCanvases: false, error: 'Database connection failed' };
  }
}

export async function saveCanvas(userId: string, name: string, nodes: any[], edges: any[]) {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB_NAME || 'postpipe';
    const db = client.db(dbName);
    console.log(`[saveCanvas] Saving canvas for user: ${userId} in db: ${dbName}`);
    
    const result = await db.collection('canvases').updateOne(
      { userId, name },
      { 
        $set: { 
          nodes, 
          edges, 
          updatedAt: new Date(),
          lastActivity: new Date() 
        },
        $setOnInsert: { 
          userId, 
          name, 
          createdAt: new Date() 
        }
      },
      { upsert: true }
    );

    console.log(`[saveCanvas] Success. Result:`, result);
    return { success: true, id: result.upsertedId?.toString() || 'updated' };
  } catch (error: any) {
    console.error('Save error:', error);
    return { success: false, error: error.message || 'Unknown save error' };
  }
}

export async function getCanvases(userId: string) {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB_NAME || 'postpipe';
    const db = client.db(dbName);
    console.log(`[getCanvases] Fetching canvases for user: ${userId} from db: ${dbName}`);
    const list = await db.collection('canvases').find({ userId }).sort({ updatedAt: -1 }).toArray();
    return { success: true, canvases: JSON.parse(JSON.stringify(list)) };
  } catch (error) {
    return { success: false, error: 'Failed to load' };
  }
}

export async function deleteCanvas(id: string) {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB_NAME || 'postpipe';
    const db = client.db(dbName);
    const { ObjectId } = require('mongodb');
    
    await db.collection('canvases').deleteOne({ _id: new ObjectId(id) });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete' };
  }
}

export async function markCanvasActivity(id: string) {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB_NAME || 'postpipe';
    const db = client.db(dbName);
    const { ObjectId } = require('mongodb');
    
    await db.collection('canvases').updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastActivity: new Date() } }
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to mark activity' };
  }
}

export async function getUserConnectors(userId: string) {
  try {
    console.log('Fetching connectors for userId:', userId);
    const client = await clientPromise;
    const db = client.db('postpipe_core');
    
    // In this schema, each user has ONE document in user_connectors with a 'connectors' array
    const userDoc = await db.collection('user_connectors').findOne({ 
      userId: userId
    });
    
    const connectors = userDoc?.connectors || [];
    
    console.log(`Found ${connectors.length} connectors for user ${userId} in postpipe_core.user_connectors`);
    return { success: true, connectors: JSON.parse(JSON.stringify(connectors)) };
  } catch (error) {
    console.error('Error fetching user connectors:', error);
    return { success: false, error: 'Failed to fetch connectors' };
  }
}
