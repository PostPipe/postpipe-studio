'use server';

import clientPromise from '@/lib/mongodb';

export async function checkUserCanvases(userId: string) {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB_NAME || 'postpipe_studio';
    const db = client.db(dbName);
    
    // Check for both common field names for user association
    const canvases = await db.collection('Canvases').find({ 
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
