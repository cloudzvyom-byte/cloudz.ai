import { supabase } from './supabase';

export const getVapiSettings = async (overrides = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  let settings = {
    privateKey: '',
    assistantId: '',
    phoneNumberId: '',
    razorpayKeyId: ''
  };

  // 1. FIRST: Try agent-specific overrides (passed from component)
  if (overrides.privateKey && overrides.assistantId) {
    return { ...settings, ...overrides };
  }

  // 2. SECOND: Try user-level VAPI settings from profiles table
  if (userId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('vapi_private_key, vapi_assistant_id, vapi_phone_number_id')
        .eq('id', userId)
        .single();
      
      if (profile?.vapi_private_key && profile?.vapi_assistant_id) {
        settings.privateKey = profile.vapi_private_key;
        settings.assistantId = profile.vapi_assistant_id;
        settings.phoneNumberId = profile.vapi_phone_number_id || '';
      }
    } catch (err) {
      console.warn('Profile Settings Lookup Failed:', err.message);
    }
  }

  // If still missing, check next level
  if (!settings.privateKey || !settings.assistantId) {
    // 3. THIRD: Try admin global settings from admin_settings table
    try {
      const { data: adminData } = await supabase.from('admin_settings').select('key, value');
      if (adminData) {
        const settingsMap = Object.fromEntries(adminData.map(s => [s.key, s.value]));
        if (settingsMap.vapiPrivateKey && settingsMap.vapiAssistantId) {
          settings.privateKey = settingsMap.vapiPrivateKey;
          settings.assistantId = settingsMap.vapiAssistantId;
          settings.phoneNumberId = settingsMap.vapiPhoneNumberId || '';
          settings.razorpayKeyId = settingsMap.razorpayKeyId || '';
        }
      }
    } catch (err) {
      console.warn('Admin Settings Lookup Failed:', err.message);
    }
  }

  // If still missing, check next level
  if (!settings.privateKey || !settings.assistantId) {
    // 4. FOURTH: Try environment variables (Vite-style)
    settings.privateKey = import.meta.env.VITE_VAPI_PRIVATE_KEY || import.meta.env.VAPI_PRIVATE_KEY || '';
    settings.assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID || import.meta.env.VAPI_ASSISTANT_ID || '';
    settings.phoneNumberId = import.meta.env.VITE_VAPI_PHONE_NUMBER_ID || import.meta.env.VAPI_PHONE_NUMBER_ID || '';
    settings.razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.RAZORPAY_KEY_ID || '';
  }

  // 5. FINAL CACHE: Try LocalStorage
  if (!settings.privateKey || !settings.assistantId) {
    try {
      const local = JSON.parse(localStorage.getItem('vapi_settings') || '{}');
      if (local.privateKey && local.assistantId) {
        settings = { ...settings, ...local };
      }
    } catch (err) {}
  }

  return { ...settings, ...overrides };
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
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
    throw new Error(`VAPI Configuration Incomplete. Missing: ${missing.join(', ')}. Please check Settings.`);
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
  if (!response.ok) throw new Error(data.message || 'API Error during VAPI call');
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
    throw new Error(`VAPI Configuration Incomplete for Support Agent. Missing: ${missing.join(', ')}. Please save your keys in the Admin Dashboard.`);
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
  if (!response.ok) throw new Error(data.message || 'API Error during VAPI Support call');
  return data;
};

export const getVapiCalls = async () => {
  const settings = await getVapiSettings();
  if (!settings.privateKey) throw new Error('VAPI Private Key missing.');

  const response = await fetch('https://api.vapi.ai/call', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'API Error during VAPI calls lookup');
  return data;
};

export const getVapiAssistant = async (assistantId) => {
  const settings = await getVapiSettings();
  if (!settings.privateKey) throw new Error('VAPI Private Key missing.');

  const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Assistant not found in VAPI');
  return data;
};

export const updateVapiAssistant = async (payload, assistantId) => {
  const settings = await getVapiSettings();
  if (!settings.privateKey) throw new Error('VAPI Private Key missing.');

  const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update VAPI assistant');
  return data;
};

export const createVapiAssistant = async (payload) => {
  const settings = await getVapiSettings();
  if (!settings.privateKey) throw new Error('VAPI Private Key missing.');

  const response = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create VAPI assistant');
  return data;
};

export const getVapiCallsByAssistant = async (assistantId) => {
  const settings = await getVapiSettings();
  if (!settings.privateKey) throw new Error('VAPI Private Key missing.');

  const response = await fetch(`https://api.vapi.ai/call?assistantId=${assistantId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'API Error during assistant calls lookup');
  return data;
};

export const uploadVapiFile = async (file) => {
  const settings = await getVapiSettings();
  if (!settings.privateKey) throw new Error('VAPI Private Key missing.');

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
  if (!response.ok) throw new Error(data.message || 'Failed to upload file to VAPI');
  return data;
};

export const sendVapiChatMessage = async (messages, assistantId) => {
  const settings = await getVapiSettings();
  if (!settings.privateKey) throw new Error('VAPI Private Key missing.');

  const response = await fetch('https://api.vapi.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.privateKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: {
        provider: "openai",
        model: "gpt-4-turbo-preview",
        messages: messages
      },
      assistantId: assistantId
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'VAPI Chat Error');
  return data;
};
