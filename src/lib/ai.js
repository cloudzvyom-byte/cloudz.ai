import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const getGroqResponse = async (messages, workspaceData) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key') {
    throw new Error('Groq API Key is missing or invalid.');
  }

  const name = workspaceData?.workspace_name || 'Cloudz AI';
  const city = workspaceData?.city || 'the cloud';
  const industry = workspaceData?.industry || 'Technology';

  const systemPrompt = `You are an AI assistant for ${name} located in ${city}. Industry: ${industry}.

YOUR TASKS:
1. Greet customers warmly
2. Answer queries about the business
3. Book appointments by collecting:
   full name, phone number, problem,
   preferred date, preferred time
4. Confirm booking and thank customer
5. If unsure say: I will connect you with our team for that.

Speak English or Hinglish based on user.
Never make up information.
When appointment booked append on new line:
BOOKING_DATA:{"name":"","phone":"","problem":"","date":"","time":""}`;

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1024,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
};
