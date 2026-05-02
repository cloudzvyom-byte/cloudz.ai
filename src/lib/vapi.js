export const getVapiSettings = async (overrides = {}) => {
  const local = JSON.parse(localStorage.getItem('vapi_settings')) || {};
  
  // 1. Env lookup (Build time)
  const env = {
    privateKey: import.meta.env.VITE_VAPI_PRIVATE_KEY || import.meta.env.VAPI_PRIVATE_KEY || import.meta.env.NEXT_PUBLIC_VAPI_KEY || '',
    assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || import.meta.env.VAPI_ASSISTANT_ID || '',
    phoneNumberId: import.meta.env.VITE_VAPI_PHONE_NUMBER_ID || import.meta.env.VAPI_PHONE_NUMBER_ID || '',
    razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.RAZORPAY_KEY_ID || ''
  };

  // 2. Database lookup (Dynamic)
  let dbSettings = {};
  try {
    const { supabase } = await import('./supabase');
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check global admin settings
    const { data: adminSettings } = await supabase.from('admin_settings').select('key, value');
    if (adminSettings) {
      adminSettings.forEach(s => {
        if (s.key === 'vapi_private_key') dbSettings.privateKey = s.value;
        if (s.key === 'vapi_assistant_id') dbSettings.assistantId = s.value;
        if (s.key === 'vapi_phone_number_id') dbSettings.phoneNumberId = s.value;
      });
    }

    // Check user profile overrides
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('vapi_key, vapi_assistant_id').eq('id', user.id).single();
      if (profile?.vapi_key) dbSettings.privateKey = profile.vapi_key;
      if (profile?.vapi_assistant_id) dbSettings.assistantId = profile.vapi_assistant_id;
    }
  } catch (err) {
    console.warn('DB Settings Lookup Failed:', err.message);
  }

  const global = { 
    privateKey: env.privateKey || local.privateKey || dbSettings.privateKey || '', 
    assistantId: env.assistantId || local.assistantId || dbSettings.assistantId || '', 
    phoneNumberId: env.phoneNumberId || local.phoneNumberId || dbSettings.phoneNumberId || '',
    razorpayKeyId: env.razorpayKeyId || local.razorpayKeyId || dbSettings.razorpayKeyId || ''
  };

  return { ...global, ...overrides };
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
  // Auto-format for Indian numbers if it looks like one (10 digits or starts with 91)
  if (cleaned.length === 10) return '+91' + cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) return '+' + cleaned;
  return '+' + cleaned;
};

export const makeVapiCall = async (lead, campaign, options = {}) => {
  const settings = await getVapiSettings(options.vapiOverrides);
  
  if (!settings.privateKey || !settings.assistantId || !settings.phoneNumberId) {
    const missing = [];
    if (!settings.privateKey) missing.push('Private Key');
    if (!settings.assistantId) missing.push('Assistant ID');
    if (!settings.phoneNumberId) missing.push('Phone Number ID');
    throw new Error(`VAPI Configuration Incomplete. Missing: ${missing.join(', ')}. Please check Admin Dashboard.`);
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

export const triggerSupportCall = async (customerPhone, customerName, assistantId, phoneNumberId) => {
  const overrides = {};
  if (assistantId) overrides.assistantId = assistantId;
  if (phoneNumberId) overrides.phoneNumberId = phoneNumberId;
  const settings = await getVapiSettings(overrides);
  
  if (!settings.privateKey || !settings.assistantId || !settings.phoneNumberId) {
    const missing = [];
    if (!settings.privateKey) missing.push('Private Key');
    if (!settings.assistantId) missing.push('Assistant ID');
    if (!settings.phoneNumberId) missing.push('Phone Number ID');
    throw new Error(`VAPI Configuration Incomplete for Support Agent. Missing: ${missing.join(', ')}.`);
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
  const settings = await getVapiSettings();
  
  if (!settings.privateKey) {
    throw new Error('VAPI Private Key missing.');
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
  const settings = await getVapiSettings();
  
  if (!settings.privateKey) {
    throw new Error('VAPI Private Key missing.');
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
  const settings = await getVapiSettings();
  
  if (!settings.privateKey) {
    throw new Error('VAPI Private Key missing.');
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
  const settings = await getVapiSettings(customAssistantId ? { assistantId: customAssistantId } : {});
  
  if (!settings.privateKey || !settings.assistantId) {
    throw new Error('VAPI Private Key or Assistant ID missing.');
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
  const settings = await getVapiSettings(customAssistantId ? { assistantId: customAssistantId } : {});
  
  if (!settings.privateKey || !settings.assistantId) {
    throw new Error('VAPI Private Key or Assistant ID missing.');
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
  const settings = await getVapiSettings();
  
  if (!settings.privateKey) {
    throw new Error('VAPI Private Key missing.');
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
  const settings = await getVapiSettings();
  
  if (!settings.privateKey) {
    throw new Error('VAPI Private Key missing.');
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
  const settings = await getVapiSettings();
  
  if (!settings.privateKey) {
    throw new Error('VAPI Private Key missing.');
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
  const settings = await getVapiSettings(assistantId ? { assistantId } : {});
  
  if (!settings.privateKey || !settings.assistantId) {
    throw new Error('VAPI Private Key or Assistant ID missing.');
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
  const settings = await getVapiSettings();
  if (!settings.privateKey) throw new Error('VAPI Private Key missing.');

  const response = await fetch('https://api.vapi.ai/phone-number', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${settings.privateKey}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch phone numbers');
  return data;
};

export const updateVapiPhoneNumber = async (phoneNumberId, payload) => {
  const settings = await getVapiSettings();
  if (!settings.privateKey) throw new Error('VAPI Private Key missing.');

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

