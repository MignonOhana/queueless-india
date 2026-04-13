require('dotenv').config({ path: '.env.local' });

async function getOpenAPI() {
  console.log("🛠️ Fetching Admin OpenAPI Schema from Supabase...");
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const json = await res.json();
  const fs = require('fs');
  fs.writeFileSync('openapi_schema_admin.json', JSON.stringify(json, null, 2));
  console.log("✅ Saved to openapi_schema_admin.json");
}

getOpenAPI();
