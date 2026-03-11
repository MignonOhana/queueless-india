import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!APIFY_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables in .env.local');
  process.exit(1);
}

const apifyClient = new ApifyClient({ token: APIFY_TOKEN });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const categoryMapping: Record<string, string> = {
  'Hospital': 'Hospital',
  'Medical Center': 'Hospital',
  'Bank': 'Bank',
  'ATM': 'Bank',
  'Salon': 'Salon',
  'Beauty': 'Salon',
  'Hair': 'Salon',
  'Government': 'Government',
  'City Hall': 'Government',
  'Police Station': 'Government',
  'Court': 'Court',
  'Post Office': 'Post Office',
  'Regional Transport Office': 'Government',
  'Event': 'Event',
  'Stadium': 'Event',
  'Cinema': 'Event',
  'Railway Station': 'Railway Station'
};

function mapCategory(categoryName: string): string {
  if (!categoryName) return 'Government'; // Default
  for (const [key, value] of Object.entries(categoryMapping)) {
    if (categoryName.includes(key)) return value;
  }
  return 'Government'; // Default to government
}

function parseTime(timeStr: string): string {
  // Try to convert "9:00 AM" to "09:00"
  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return timeStr;
    let [_, hours, mins, period] = match;
    let h = parseInt(hours);
    if (period.toUpperCase() === 'PM' && h < 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${mins}`;
  } catch (e) {
    return timeStr;
  }
}

function formatOpHoursJson(openingHours: any[]): any {
  const daysMap: Record<string, string> = {
    'Monday': 'mon', 'Tuesday': 'tue', 'Wednesday': 'wed',
    'Thursday': 'thu', 'Friday': 'fri', 'Saturday': 'sat', 'Sunday': 'sun'
  };

  const result: any = {
    mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null
  };

  if (!openingHours || !Array.isArray(openingHours)) return result;

  openingHours.forEach(item => {
    const dayKey = daysMap[item.day];
    if (dayKey) {
      if (item.hours === 'Closed') {
        result[dayKey] = null;
      } else {
        const parts = item.hours.split(' – '); // Note the special dash
        if (parts.length === 2) {
          result[dayKey] = [{
            open: parseTime(parts[0]),
            close: parseTime(parts[1])
          }];
        }
      }
    }
  });

  return result;
}

async function scrape() {
  const input = {
    "searchStringsArray": [
      "government hospital queue Delhi",
      "SBI bank branch Mumbai",
      "passport seva kendra India",
      "AIIMS OPD registration",
      "district court filing Delhi",
      "RTO office Bangalore",
      "post office Mumbai",
      "HDFC bank Chennai"
    ],
    "maxCrawledPlacesPerSearch": 10,
    "language": "en",
    "country": "IN",
    "includeHistogram": true,
    "includeOpeningHours": true
  };

  console.log('🚀 Starting Apify scrape...');
  const run = await apifyClient.actor('compass/crawler-google-places').call(input);
  console.log(`✅ Run finished: ${run.id}. Fetching results...`);

  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
  console.log(`📊 Fetched ${items.length} items. Mapping to database...`);

  const businesses = items.map((item: any) => {
    const id = slugify(item.title, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 5);
    const category = mapCategory(item.categoryName);
    
    // Formatting opHours string
    let opHoursStr = '09:00-17:00';
    if (item.openingHours && item.openingHours.length > 0) {
      const firstDay = item.openingHours.find((d: any) => d.hours !== 'Closed');
      if (firstDay) {
        const parts = firstDay.hours.split(' – ');
        if (parts.length === 2) {
          opHoursStr = `${parseTime(parts[0])}-${parseTime(parts[1])}`;
        }
      }
    }

    const description = [
      item.description,
      item.website ? `Website: ${item.website}` : null
    ].filter(Boolean).join('\n');

    return {
      id,
      name: item.title,
      category,
      description: description || 'No description available',
      location: item.address,
      latitude: item.location?.lat,
      longitude: item.location?.lng,
      phone: item.phone,
      opHours: opHoursStr,
      avg_rating: item.totalScore || 0,
      total_reviews: item.reviewsCount || 0,
      is_verified: true,
      owner_id: null, // Scraped businesses are platform listings
      plan: 'free',
      whatsapp_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });

  console.log('💾 Upserting businesses to Supabase...');
  // We'll use id as the conflict target since it's the primary key
  const { error } = await supabase.from('businesses').upsert(businesses, { onConflict: 'id' });

  if (error) {
    console.error('❌ Error upserting to Supabase:', error);
  } else {
    console.log('✨ Successfully populated businesses table!');
  }
}

scrape().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
