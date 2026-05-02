const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if (k && v) acc[k] = v.join('=').trim();
  return acc;
}, {});

async function run() {
  const vapiKey = env.VITE_VAPI_PRIVATE_KEY;
  if (!vapiKey) return console.error("No VAPI key found in .env");

  // Fetch all assistants
  const res = await fetch('https://api.vapi.ai/assistant', {
    headers: { 'Authorization': `Bearer ${vapiKey}` }
  });
  const data = await res.json();
  const assistants = Array.isArray(data) ? data : [];
  console.log(`Found ${assistants.length} assistants`);

  // We want to delete all "Sarah (Customer Support)" that we don't need, or anything else
  // Keep the latest one, or just print them first to be safe
  for (const a of assistants) {
    console.log(`${a.name} - ${a.id} - ${a.createdAt}`);
  }
}
run();
