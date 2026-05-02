const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if (k && v) acc[k] = v.join('=').trim();
  return acc;
}, {});

async function run() {
  const vapiKey = env.VITE_VAPI_PRIVATE_KEY;
  if (!vapiKey) return console.error("No VAPI key found in .env");

  const res = await fetch('https://api.vapi.ai/assistant', {
    headers: { 'Authorization': `Bearer ${vapiKey}` }
  });
  const data = await res.json();
  const assistants = Array.isArray(data) ? data : [];
  console.log(`Found ${assistants.length} assistants`);

  for (const a of assistants) {
    console.log(`${a.name} - ${a.id} - ${a.createdAt}`);
  }
}
run();
