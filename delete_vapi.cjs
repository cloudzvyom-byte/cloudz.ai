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

  const keepId = 'c81c572f-c7ab-4218-9137-2dc36f5b7346';

  for (const a of assistants) {
    if (a.id !== keepId) {
      console.log(`Deleting ${a.name} - ${a.id}...`);
      const delRes = await fetch(`https://api.vapi.ai/assistant/${a.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${vapiKey}` }
      });
      if (delRes.ok) {
        console.log(`Deleted ${a.id}`);
      } else {
        console.error(`Failed to delete ${a.id}: ${delRes.statusText}`);
      }
    } else {
      console.log(`Keeping ${a.name} - ${a.id}`);
    }
  }
}
run();
