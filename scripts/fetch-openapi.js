require('dotenv').config({ path: '.env.local' });

async function getOpenAPI() {
  console.log("🛠️ Fetching OpenAPI Schema from Supabase...");
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
  const json = await res.json();
  const fs = require('fs');
  fs.writeFileSync('openapi_schema.json', JSON.stringify(json, null, 2));
  console.log("✅ Saved to openapi_schema.json");
}

getOpenAPI();
