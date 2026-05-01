'use server';

const PIKO_API_URL = process.env.NEXT_PUBLIC_PIKO_API_URL || 'http://localhost:8000/api';

export async function sendPikoMessage(message: string, sessionId: string, apiKey?: string) {
  try {
    const response = await fetch(`${PIKO_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Backend expects: { message: string, sessionId: string, apiKey: string }
      body: JSON.stringify({ message, sessionId, apiKey }),
    });

    if (!response.ok) {
      throw new Error(`Piko API error: ${response.status}`);
    }

    const data = await response.json();
    return { 
      success: true, 
      response: data.response,
      actionTaken: data.actionTaken,
      result: data.result,
      messages: data.messages // Optional: full chat history
    };
  } catch (error) {
    console.error('Error calling Piko AI:', error);
    return { success: false, error: 'Failed to connect to Piko AI backend.' };
  }
}

export async function getPikoHistory() {
  try {
    const response = await fetch(`${PIKO_API_URL}/history`);
    if (!response.ok) throw new Error("Failed to fetch history");
    return await response.json();
  } catch (error) {
    console.error("Error fetching Piko history:", error);
    return [];
  }
}

export async function getPikoConversation(sessionId: string) {
  try {
    const response = await fetch(`${PIKO_API_URL}/conversation/${sessionId}`);
    if (!response.ok) throw new Error("Failed to fetch conversation");
    return await response.json();
  } catch (error) {
    console.error("Error fetching Piko conversation:", error);
    return null;
  }
}

export async function deletePikoConversation(sessionId: string) {
  try {
    const response = await fetch(`${PIKO_API_URL}/conversation/${sessionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error("Failed to delete conversation");
    return true;
  } catch (error) {
    console.error("Error deleting Piko conversation:", error);
    return false;
  }
}

export async function getPikoStructure(apiKey: string) {
  try {
    const POSTPIPE_URL = process.env.POSTPIPE_URL || 'http://localhost:9002';
    const headers = { 'x-piko-api-key': apiKey };
    
    const [formsRes, presetsRes] = await Promise.all([
      fetch(`${POSTPIPE_URL}/api/piko/v1/forms`, { headers, cache: 'no-store' }),
      fetch(`${POSTPIPE_URL}/api/piko/v1/auth-presets`, { headers, cache: 'no-store' })
    ]);

    let forms = [];
    let presets = [];
    
    if (formsRes.ok) {
      const data = await formsRes.json();
      forms = data.forms || [];
    }
    
    if (presetsRes.ok) {
      const data = await presetsRes.json();
      presets = data.presets || [];
    }

    return { success: true, forms, presets };
  } catch (error) {
    console.error("Error fetching Piko structure:", error);
    return { success: false, forms: [], presets: [] };
  }
}

export async function getPikoConnectors(apiKey: string) {
  try {
    const POSTPIPE_URL = process.env.POSTPIPE_URL || 'http://localhost:9002';
    const response = await fetch(`${POSTPIPE_URL}/api/piko/v1/connectorsAndSecrets`, {
      headers: { 'x-piko-api-key': apiKey }
    });

    if (!response.ok) throw new Error("Failed to fetch connectors");
    
    const data = await response.json();
    return { success: true, connectors: data.connectors || [] };
  } catch (error) {
    console.error("Error fetching Piko connectors:", error);
    return { success: false, connectors: [] };
  }
}

export async function getPikoFormSchema(formId: string, apiKey: string) {
  try {
    const POSTPIPE_URL = process.env.POSTPIPE_URL || 'http://localhost:9002';
    const response = await fetch(`${POSTPIPE_URL}/api/piko/v1/forms/${formId}`, {
      headers: { 'x-piko-api-key': apiKey },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error("Failed to fetch form schema");
    
    const data = await response.json();
    return { success: true, form: data.form };
  } catch (error) {
    console.error("Error fetching form schema:", error);
    return { success: false, error: "Failed to fetch form schema" };
  }
}
