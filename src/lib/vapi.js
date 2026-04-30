export const getVapiSettings = (overrides = {}) => {
  const global = JSON.parse(localStorage.getItem('vapi_settings')) || { 
    privateKey: import.meta.env.VITE_VAPI_PRIVATE_KEY || '', 
    assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '', 
    phoneNumberId: import.meta.env.VITE_VAPI_PHONE_NUMBER_ID || '' 
  };
  return { ...global, ...overrides };
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) return '+' + cleaned;
  if (cleaned.length === 10) return '+91' + cleaned;
  return '+' + cleaned;
};

export const makeVapiCall = async (lead, campaign, options = {}) => {
  const settings = getVapiSettings(options.vapiOverrides);
  
  if (!settings.privateKey || !settings.assistantId || !settings.phoneNumberId) {
    throw new Error('VAPI configuration missing. Set keys in Admin Dashboard.');
  }

  const response = await fetch('https://api.vapi.ai/call/phone', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistantId: settings.assistantId,
      phoneNumberId: settings.phoneNumberId,
      customer: {
        number: formatPhone(lead.phone),
        name: lead.name
      },
      assistantOverrides: {
        recordingEnabled: options.recordCalls ?? campaign.recordCalls ?? true,
        variableValues: {
          customerName: lead.name,
          customerPhone: lead.phone,
          customerEmail: lead.email || '',
          campaignName: campaign.name,
          campaignId: campaign.id,
          dialerType: options.dialerType || campaign.dialerType || 'power'
        }
      },
      metadata: {
        campaignId: campaign.id,
        leadId: lead.id,
        dialerType: options.dialerType || campaign.dialerType || 'power'
      }
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error during VAPI call');
  }

  return data;
};

export const triggerSupportCall = async (customerPhone, customerName, assistantId) => {
  const settings = getVapiSettings(assistantId ? { assistantId } : {});
  
  if (!settings.privateKey || !settings.assistantId || !settings.phoneNumberId) {
    throw new Error('VAPI configuration missing for Support Agent.');
  }

  const response = await fetch('https://api.vapi.ai/call/phone', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistantId: settings.assistantId,
      phoneNumberId: settings.phoneNumberId,
      customer: {
        number: formatPhone(customerPhone),
        name: customerName || 'Customer'
      },
      assistantOverrides: {
        variableValues: {
          customerName: customerName || 'Customer',
          agentRole: 'Customer Support'
        }
      },
      metadata: {
        callType: 'inbound_support_simulation'
      }
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error during VAPI Support call');
  }

  return data;
};

export const getVapiCalls = async () => {
  const settings = getVapiSettings();
  
  if (!settings.privateKey) {
    throw new Error('VAPI configuration missing.');
  }

  const response = await fetch('https://api.vapi.ai/call', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error during VAPI call fetch');
  }

  return data;
};

export const getVapiCallsByAssistant = async (assistantId) => {
  const settings = getVapiSettings();
  
  if (!settings.privateKey) {
    throw new Error('VAPI configuration missing.');
  }

  const url = new URL('https://api.vapi.ai/call');
  if (assistantId) url.searchParams.set('assistantId', assistantId);
  url.searchParams.set('limit', '100');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error during VAPI call fetch');
  }

  return Array.isArray(data) ? data : (data.results || []);
};

export const getVapiCallDetails = async (callId) => {
  const settings = getVapiSettings();
  
  if (!settings.privateKey) {
    throw new Error('VAPI configuration missing.');
  }

  const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error during VAPI call detail fetch');
  }

  return data;
};

export const getVapiAssistant = async (customAssistantId) => {
  const settings = getVapiSettings(customAssistantId ? { assistantId: customAssistantId } : {});
  
  if (!settings.privateKey || !settings.assistantId) {
    throw new Error('VAPI configuration missing.');
  }

  const response = await fetch(`https://api.vapi.ai/assistant/${settings.assistantId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error during VAPI assistant fetch');
  }

  return data;
};

export const updateVapiAssistant = async (payload, customAssistantId) => {
  const settings = getVapiSettings(customAssistantId ? { assistantId: customAssistantId } : {});
  
  if (!settings.privateKey || !settings.assistantId) {
    throw new Error('VAPI configuration missing.');
  }

  const response = await fetch(`https://api.vapi.ai/assistant/${settings.assistantId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error during VAPI assistant update');
  }

  return data;
};

export const createVapiAssistant = async (payload) => {
  const settings = getVapiSettings();
  
  if (!settings.privateKey) {
    throw new Error('VAPI configuration missing.');
  }

  const response = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error during VAPI assistant creation');
  }

  return data;
};

export const uploadVapiFile = async (file) => {
  const settings = getVapiSettings();
  
  if (!settings.privateKey) {
    throw new Error('VAPI configuration missing.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.vapi.ai/file', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`
    },
    body: formData
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error during VAPI file upload');
  }

  return data;
};

export const deleteVapiFile = async (fileId) => {
  const settings = getVapiSettings();
  
  if (!settings.privateKey) {
    throw new Error('VAPI configuration missing.');
  }

  const response = await fetch(`https://api.vapi.ai/file/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'API Error during VAPI file deletion');
  }

  return true;
};

export const sendVapiChatMessage = async (messages, assistantId) => {
  const settings = getVapiSettings(assistantId ? { assistantId } : {});
  
  if (!settings.privateKey || !settings.assistantId) {
    throw new Error('VAPI configuration missing.');
  }

  const response = await fetch('https://api.vapi.ai/assistant/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistantId: settings.assistantId,
      messages: messages
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error during VAPI chat');
  }

  return data;
};

/* ─── Phone Number Management ──────────────────────────────────── */

export const getVapiPhoneNumbers = async () => {
  const settings = getVapiSettings();
  if (!settings.privateKey) throw new Error('VAPI configuration missing.');

  const response = await fetch('https://api.vapi.ai/phone-number', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${settings.privateKey}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch phone numbers');
  return data;
};

export const updateVapiPhoneNumber = async (phoneNumberId, payload) => {
  const settings = getVapiSettings();
  if (!settings.privateKey) throw new Error('VAPI configuration missing.');

  const response = await fetch(`https://api.vapi.ai/phone-number/${phoneNumberId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update phone number');
  return data;
};

