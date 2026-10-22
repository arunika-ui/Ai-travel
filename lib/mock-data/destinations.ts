import { Destination, Hotel, Place } from "@/lib/trips/types";

export const DESTINATIONS: Destination[] = [
  {
    id: "udaipur",
    name: "Udaipur",
    state: "Rajasthan",
    lat: 24.5854,
    lng: 73.7125,
    blurb: "The City of Lakes, known for palaces, lakes and heritage.",
  },
  {
    id: "goa",
    name: "Goa",
    state: "Goa",
    lat: 15.2993,
    lng: 74.124,
    blurb: "Beaches, Portuguese heritage and vibrant nightlife.",
  },
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    lat: 26.9124,
    lng: 75.7873,
    blurb: "The Pink City, famous for forts, palaces and markets.",
  },
  {
    id: "manali",
    name: "Manali",
    state: "Himachal Pradesh",
    lat: 32.2432,
    lng: 77.1892,
    blurb: "Himalayan valley town for nature and adventure.",
  },
  {
    id: "rishikesh",
    name: "Rishikesh",
    state: "Uttarakhand",
    lat: 30.0869,
    lng: 78.2676,
    blurb: "Yoga capital on the Ganges, with adventure and temples.",
  },
];

// Helper to keep entries terse while staying typed correctly.
function place(p: Omit<Place, "id">, cityId: string, idx: number): Place {
  return { id: `${cityId}-p${idx}`, ...p };
}

export const PLACES: Place[] = [
  // ---------------- Udaipur ----------------
  ...(
    [
      { name: "City Palace", category: "heritage", indoor: true, lat: 24.5764, lng: 73.6833, durationMinutes: 120, costPerPersonINR: 300, openHour: 9, closeHour: 17, rating: 4.6, description: "Grand palace complex overlooking Lake Pichola." },
      { name: "Lake Pichola Boat Ride", category: "lake", indoor: false, lat: 24.5717, lng: 73.6805, durationMinutes: 60, costPerPersonINR: 400, openHour: 10, closeHour: 18, rating: 4.7, description: "Scenic boat ride past Jag Mandir and the ghats." },
      { name: "Jagdish Temple", category: "temple", indoor: true, lat: 24.5785, lng: 73.683, durationMinutes: 45, costPerPersonINR: 0, openHour: 5, closeHour: 21, rating: 4.5, description: "Intricately carved Indo-Aryan temple near City Palace." },
      { name: "Saheliyon Ki Bari", category: "nature", indoor: false, lat: 24.5967, lng: 73.6833, durationMinutes: 60, costPerPersonINR: 50, openHour: 9, closeHour: 19, rating: 4.3, description: "Garden of fountains laid out for royal maids of honour." },
      { name: "Bagore Ki Haveli Museum", category: "museum", indoor: true, lat: 24.5775, lng: 73.682, durationMinutes: 75, costPerPersonINR: 150, openHour: 10, closeHour: 19, rating: 4.4, description: "Restored haveli with Mewar-era artefacts and evening dance show." },
      { name: "Fateh Sagar Lake", category: "lake", indoor: false, lat: 24.595, lng: 73.6883, durationMinutes: 60, costPerPersonINR: 0, openHour: 6, closeHour: 20, rating: 4.4, description: "Serene lake with island gardens and boating." },
      { name: "Ambrai Ghat Sunset Point", category: "lake", indoor: false, lat: 24.5797, lng: 73.6848, durationMinutes: 45, costPerPersonINR: 0, openHour: 6, closeHour: 21, rating: 4.6, description: "Best sunset view of City Palace across the lake." },
      { name: "Ambrai Restaurant", category: "food", indoor: false, lat: 24.58, lng: 73.685, durationMinutes: 75, costPerPersonINR: 800, openHour: 12, closeHour: 23, rating: 4.5, description: "Lakeside dining with a view of the City Palace." },
      { name: "Millets of Mewar Cafe", category: "cafe", indoor: true, lat: 24.577, lng: 73.6825, durationMinutes: 60, costPerPersonINR: 350, openHour: 8, closeHour: 22, rating: 4.3, description: "Organic, millet-based healthy cafe fare." },
      { name: "Natraj Dining Hall", category: "food", indoor: true, lat: 24.5801, lng: 73.6795, durationMinutes: 60, costPerPersonINR: 300, openHour: 11, closeHour: 23, rating: 4.4, description: "Legendary unlimited Rajasthani thali." },
      { name: "Hathi Pol Bazaar", category: "market", indoor: false, lat: 24.584, lng: 73.685, durationMinutes: 90, costPerPersonINR: 500, openHour: 10, closeHour: 21, rating: 4.1, description: "Market for miniature paintings, textiles and silver." },
      { name: "Bapu Bazaar", category: "shopping", indoor: false, lat: 24.5815, lng: 73.6845, durationMinutes: 75, costPerPersonINR: 600, openHour: 10, closeHour: 21, rating: 4.0, description: "Local shopping street for handicrafts and clothes." },
      { name: "Sajjangarh Monsoon Palace", category: "heritage", indoor: true, lat: 24.6192, lng: 73.6433, durationMinutes: 90, costPerPersonINR: 150, openHour: 9, closeHour: 18, rating: 4.3, description: "Hilltop palace with panoramic valley views." },
      { name: "Vintage Car Museum", category: "museum", indoor: true, lat: 24.5689, lng: 73.6922, durationMinutes: 45, costPerPersonINR: 250, openHour: 9, closeHour: 19, rating: 4.2, description: "Royal vintage car collection including a Rolls-Royce." },
      { name: "Shilpgram Crafts Village", category: "market", indoor: false, lat: 24.5597, lng: 73.6553, durationMinutes: 90, costPerPersonINR: 100, openHour: 11, closeHour: 19, rating: 4.0, description: "Rural arts and crafts village with live demonstrations." },
      { name: "Sunset Terrace Cafe", category: "nightlife", indoor: false, lat: 24.5788, lng: 73.684, durationMinutes: 90, costPerPersonINR: 600, openHour: 17, closeHour: 24, rating: 4.4, description: "Rooftop lounge with live music overlooking the lake." },
      { name: "Gangaur Ghat", category: "lake", indoor: false, lat: 24.578, lng: 73.6837, durationMinutes: 30, costPerPersonINR: 0, openHour: 6, closeHour: 20, rating: 4.3, description: "Lively ghat popular for photos and evening walks." },
    ] as Omit<Place, "id" | "cityId">[]
  ).map((p, i) => place({ ...p, cityId: "udaipur" }, "udaipur", i + 1)),

  // ---------------- Goa ----------------
  ...(
    [
      { name: "Baga Beach", category: "beach", indoor: false, lat: 15.5553, lng: 73.7517, durationMinutes: 120, costPerPersonINR: 0, openHour: 6, closeHour: 22, rating: 4.3, description: "Lively beach with water sports and beach shacks." },
      { name: "Calangute Beach", category: "beach", indoor: false, lat: 15.5435, lng: 73.7554, durationMinutes: 120, costPerPersonINR: 0, openHour: 6, closeHour: 22, rating: 4.2, description: "Queen of Goan beaches, wide and popular." },
      { name: "Basilica of Bom Jesus", category: "heritage", indoor: true, lat: 15.5009, lng: 73.9116, durationMinutes: 60, costPerPersonINR: 0, openHour: 9, closeHour: 18, rating: 4.6, description: "UNESCO World Heritage baroque church in Old Goa." },
      { name: "Fort Aguada", category: "heritage", indoor: false, lat: 15.4925, lng: 73.7738, durationMinutes: 75, costPerPersonINR: 50, openHour: 9, closeHour: 18, rating: 4.4, description: "17th-century Portuguese fort with a lighthouse." },
      { name: "Anjuna Flea Market", category: "market", indoor: false, lat: 15.5744, lng: 73.7399, durationMinutes: 90, costPerPersonINR: 500, openHour: 10, closeHour: 20, rating: 4.1, description: "Famous Wednesday flea market for souvenirs and clothes." },
      { name: "Dudhsagar Falls", category: "nature", indoor: false, lat: 15.3144, lng: 74.3142, durationMinutes: 180, costPerPersonINR: 600, openHour: 7, closeHour: 17, rating: 4.6, description: "Four-tiered waterfall on the Goa-Karnataka border." },
      { name: "Britto's Beach Shack", category: "food", indoor: false, lat: 15.556, lng: 73.752, durationMinutes: 75, costPerPersonINR: 700, openHour: 11, closeHour: 23, rating: 4.3, description: "Seafood shack right on Baga beach." },
      { name: "Vinayak Family Restaurant", category: "food", indoor: true, lat: 15.512, lng: 73.818, durationMinutes: 60, costPerPersonINR: 350, openHour: 11, closeHour: 22, rating: 4.4, description: "Local Goan fish thali favourite in Assagao." },
      { name: "Artjuna Cafe", category: "cafe", indoor: true, lat: 15.5758, lng: 73.7406, durationMinutes: 60, costPerPersonINR: 450, openHour: 9, closeHour: 21, rating: 4.4, description: "Boho garden cafe with organic menu near Anjuna." },
      { name: "Tito's Lane", category: "nightlife", indoor: false, lat: 15.5559, lng: 73.7524, durationMinutes: 150, costPerPersonINR: 1200, openHour: 20, closeHour: 24, rating: 4.0, description: "Iconic Baga nightlife strip of clubs and bars." },
      { name: "Curlies Beach Shack", category: "nightlife", indoor: false, lat: 15.5802, lng: 73.7343, durationMinutes: 120, costPerPersonINR: 900, openHour: 11, closeHour: 24, rating: 4.1, description: "Anjuna beach shack famous for sunset parties." },
      { name: "Chapora Fort", category: "heritage", indoor: false, lat: 15.6033, lng: 73.7358, durationMinutes: 45, costPerPersonINR: 0, openHour: 8, closeHour: 18, rating: 4.3, description: "Hilltop fort overlooking the Chapora river, Dil Chahta Hai fame." },
      { name: "Mapusa Market", category: "market", indoor: false, lat: 15.5937, lng: 73.8142, durationMinutes: 75, costPerPersonINR: 400, openHour: 8, closeHour: 19, rating: 4.0, description: "Authentic local market for spices and cashews." },
      { name: "Palolem Beach", category: "beach", indoor: false, lat: 15.0101, lng: 74.0233, durationMinutes: 150, costPerPersonINR: 0, openHour: 6, closeHour: 22, rating: 4.6, description: "Crescent-shaped quiet beach in South Goa." },
      { name: "Grand Island Dolphin Trip", category: "adventure", indoor: false, lat: 15.455, lng: 73.78, durationMinutes: 150, costPerPersonINR: 1500, openHour: 8, closeHour: 13, rating: 4.2, description: "Boat trip for dolphin spotting and snorkelling." },
      { name: "Thalassa", category: "nightlife", indoor: false, lat: 15.5805, lng: 73.7347, durationMinutes: 150, costPerPersonINR: 1300, openHour: 19, closeHour: 24, rating: 4.3, description: "Greek-style cliffside restaurant and sunset bar." },
      { name: "Shri Mangeshi Temple", category: "temple", indoor: true, lat: 15.4442, lng: 73.9969, durationMinutes: 45, costPerPersonINR: 0, openHour: 6, closeHour: 21, rating: 4.5, description: "One of Goa's most revered Hindu temples." },
    ] as Omit<Place, "id" | "cityId">[]
  ).map((p, i) => place({ ...p, cityId: "goa" }, "goa", i + 1)),

  // ---------------- Jaipur ----------------
  ...(
    [
      { name: "Amber Fort", category: "heritage", indoor: false, lat: 26.9855, lng: 75.8513, durationMinutes: 150, costPerPersonINR: 200, openHour: 8, closeHour: 17, rating: 4.7, description: "Majestic hilltop fort with mirror-work palace." },
      { name: "Hawa Mahal", category: "heritage", indoor: true, lat: 26.9239, lng: 75.8267, durationMinutes: 45, costPerPersonINR: 50, openHour: 9, closeHour: 17, rating: 4.5, description: "Iconic Palace of Winds with honeycomb facade." },
      { name: "City Palace Jaipur", category: "heritage", indoor: true, lat: 26.9258, lng: 75.8237, durationMinutes: 120, costPerPersonINR: 300, openHour: 9, closeHour: 17, rating: 4.6, description: "Royal residence blending Rajput and Mughal styles." },
      { name: "Jantar Mantar", category: "heritage", indoor: false, lat: 26.9246, lng: 75.8247, durationMinutes: 60, costPerPersonINR: 50, openHour: 9, closeHour: 17, rating: 4.4, description: "UNESCO astronomical observatory of giant instruments." },
      { name: "Albert Hall Museum", category: "museum", indoor: true, lat: 26.9108, lng: 75.8192, durationMinutes: 75, costPerPersonINR: 150, openHour: 9, closeHour: 17, rating: 4.3, description: "Oldest museum in Rajasthan with Indo-Saracenic architecture." },
      { name: "Nahargarh Fort", category: "heritage", indoor: false, lat: 26.9376, lng: 75.8156, durationMinutes: 90, costPerPersonINR: 100, openHour: 10, closeHour: 18, rating: 4.5, description: "Fort with panoramic sunset views over Jaipur." },
      { name: "Johari Bazaar", category: "market", indoor: false, lat: 26.9185, lng: 75.8258, durationMinutes: 90, costPerPersonINR: 700, openHour: 10, closeHour: 21, rating: 4.2, description: "Famous jewellery and gemstone market." },
      { name: "Bapu Bazaar Jaipur", category: "shopping", indoor: false, lat: 26.9156, lng: 75.8217, durationMinutes: 75, costPerPersonINR: 500, openHour: 10, closeHour: 21, rating: 4.0, description: "Colourful bazaar for textiles and juttis." },
      { name: "Chokhi Dhani Village", category: "food", indoor: false, lat: 26.7537, lng: 75.8847, durationMinutes: 150, costPerPersonINR: 900, openHour: 17, closeHour: 23, rating: 4.4, description: "Ethnic village resort with Rajasthani dinner and folk shows." },
      { name: "Laxmi Mishthan Bhandar", category: "food", indoor: true, lat: 26.9158, lng: 75.8238, durationMinutes: 45, costPerPersonINR: 250, openHour: 8, closeHour: 22, rating: 4.3, description: "Legendary sweets and snacks shop since 1954." },
      { name: "Anokhi Cafe", category: "cafe", indoor: true, lat: 26.9077, lng: 75.8064, durationMinutes: 60, costPerPersonINR: 400, openHour: 9, closeHour: 21, rating: 4.4, description: "Garden cafe attached to a textile museum." },
      { name: "Jal Mahal", category: "lake", indoor: false, lat: 26.9535, lng: 75.8463, durationMinutes: 30, costPerPersonINR: 0, openHour: 6, closeHour: 20, rating: 4.3, description: "Palace floating in the middle of Man Sagar Lake." },
      { name: "Birla Mandir Jaipur", category: "temple", indoor: true, lat: 26.8886, lng: 75.8064, durationMinutes: 45, costPerPersonINR: 0, openHour: 6, closeHour: 20, rating: 4.4, description: "White marble temple dedicated to Lakshmi Narayan." },
      { name: "Patrika Gate", category: "heritage", indoor: false, lat: 26.8502, lng: 75.8075, durationMinutes: 30, costPerPersonINR: 0, openHour: 6, closeHour: 21, rating: 4.3, description: "Vividly painted nine-gate entrance to Jawahar Circle." },
      { name: "Panna Meena ka Kund", category: "heritage", indoor: false, lat: 26.9838, lng: 75.8508, durationMinutes: 30, costPerPersonINR: 0, openHour: 7, closeHour: 18, rating: 4.4, description: "Symmetric stepwell near Amber Fort." },
    ] as Omit<Place, "id" | "cityId">[]
  ).map((p, i) => place({ ...p, cityId: "jaipur" }, "jaipur", i + 1)),

  // ---------------- Manali ----------------
  ...(
    [
      { name: "Hadimba Temple", category: "temple", indoor: true, lat: 32.2432, lng: 77.1702, durationMinutes: 45, costPerPersonINR: 0, openHour: 7, closeHour: 19, rating: 4.5, description: "Ancient wooden temple set in a cedar forest." },
      { name: "Solang Valley", category: "adventure", indoor: false, lat: 32.3177, lng: 77.1554, durationMinutes: 180, costPerPersonINR: 1200, openHour: 9, closeHour: 17, rating: 4.5, description: "Paragliding, zorbing and cable car adventure hub." },
      { name: "Rohtang Pass", category: "nature", indoor: false, lat: 32.3719, lng: 77.2492, durationMinutes: 240, costPerPersonINR: 1000, openHour: 8, closeHour: 16, rating: 4.4, description: "High-altitude mountain pass with snow most of the year." },
      { name: "Old Manali Cafes", category: "cafe", indoor: true, lat: 32.2511, lng: 77.1756, durationMinutes: 75, costPerPersonINR: 450, openHour: 9, closeHour: 22, rating: 4.4, description: "Riverside cafe lane with live music and continental food." },
      { name: "Vashisht Hot Springs", category: "nature", indoor: false, lat: 32.2569, lng: 77.1922, durationMinutes: 60, costPerPersonINR: 50, openHour: 6, closeHour: 20, rating: 4.1, description: "Natural sulphur hot water springs and temple." },
      { name: "Manu Temple", category: "temple", indoor: true, lat: 32.2538, lng: 77.1783, durationMinutes: 30, costPerPersonINR: 0, openHour: 7, closeHour: 19, rating: 4.2, description: "Temple dedicated to sage Manu in Old Manali." },
      { name: "Mall Road Market", category: "market", indoor: false, lat: 32.2396, lng: 77.1887, durationMinutes: 90, costPerPersonINR: 500, openHour: 10, closeHour: 21, rating: 4.1, description: "Main shopping and food strip of Manali town." },
      { name: "Johnson's Cafe", category: "food", indoor: true, lat: 32.2419, lng: 77.1898, durationMinutes: 75, costPerPersonINR: 700, openHour: 11, closeHour: 23, rating: 4.4, description: "Popular trout fish specialty restaurant." },
      { name: "Beas River Rafting", category: "adventure", indoor: false, lat: 32.2944, lng: 77.1544, durationMinutes: 90, costPerPersonINR: 800, openHour: 9, closeHour: 16, rating: 4.3, description: "White-water rafting on the Beas river." },
      { name: "Van Vihar National Park", category: "nature", indoor: false, lat: 32.2378, lng: 77.1933, durationMinutes: 60, costPerPersonINR: 30, openHour: 8, closeHour: 18, rating: 4.0, description: "Deodar forest park with a small lake, near the Mall." },
      { name: "Jogini Falls Trek", category: "nature", indoor: false, lat: 32.2628, lng: 77.1958, durationMinutes: 120, costPerPersonINR: 0, openHour: 7, closeHour: 17, rating: 4.3, description: "Easy trek to a scenic waterfall above Vashisht." },
      { name: "Tibetan Monastery Manali", category: "heritage", indoor: true, lat: 32.2404, lng: 77.1889, durationMinutes: 30, costPerPersonINR: 0, openHour: 8, closeHour: 19, rating: 4.1, description: "Colourful Buddhist monastery and handicraft shop." },
      { name: "Drifters Cafe", category: "nightlife", indoor: true, lat: 32.2507, lng: 77.1761, durationMinutes: 120, costPerPersonINR: 900, openHour: 17, closeHour: 24, rating: 4.2, description: "Live music cafe-bar popular with backpackers." },
    ] as Omit<Place, "id" | "cityId">[]
  ).map((p, i) => place({ ...p, cityId: "manali" }, "manali", i + 1)),

  // ---------------- Rishikesh ----------------
  ...(
    [
      { name: "Laxman Jhula", category: "heritage", indoor: false, lat: 30.1217, lng: 78.3281, durationMinutes: 45, costPerPersonINR: 0, openHour: 6, closeHour: 21, rating: 4.4, description: "Iconic suspension bridge over the Ganges." },
      { name: "Ram Jhula & Parmarth Niketan", category: "heritage", indoor: false, lat: 30.1131, lng: 78.3217, durationMinutes: 60, costPerPersonINR: 0, openHour: 6, closeHour: 21, rating: 4.5, description: "Bridge and ashram ghat known for evening Ganga Aarti." },
      { name: "Triveni Ghat Aarti", category: "temple", indoor: false, lat: 30.1033, lng: 78.2944, durationMinutes: 60, costPerPersonINR: 0, openHour: 18, closeHour: 20, rating: 4.7, description: "Evening river-worship ceremony with lamps and chants." },
      { name: "Beatles Ashram", category: "heritage", indoor: true, lat: 30.1206, lng: 78.3133, durationMinutes: 75, costPerPersonINR: 600, openHour: 9, closeHour: 17, rating: 4.3, description: "Former ashram where The Beatles stayed in 1968." },
      { name: "River Rafting Rishikesh", category: "adventure", indoor: false, lat: 30.1428, lng: 78.3139, durationMinutes: 120, costPerPersonINR: 900, openHour: 9, closeHour: 16, rating: 4.6, description: "Grade III rapids rafting on the Ganges." },
      { name: "Neer Garh Waterfall", category: "nature", indoor: false, lat: 30.1428, lng: 78.3011, durationMinutes: 90, costPerPersonINR: 50, openHour: 8, closeHour: 18, rating: 4.2, description: "Short trek to a multi-tiered waterfall." },
      { name: "Chotiwala Restaurant", category: "food", indoor: true, lat: 30.1219, lng: 78.3272, durationMinutes: 60, costPerPersonINR: 350, openHour: 9, closeHour: 22, rating: 4.1, description: "Famous all-vegetarian thali restaurant since 1958." },
      { name: "Ganga Beach Cafe", category: "cafe", indoor: false, lat: 30.1225, lng: 78.3258, durationMinutes: 75, costPerPersonINR: 400, openHour: 8, closeHour: 22, rating: 4.3, description: "Riverside cafe with floating decks and Ganga views." },
      { name: "Kunjapuri Temple Sunrise", category: "temple", indoor: false, lat: 30.1769, lng: 78.3531, durationMinutes: 90, costPerPersonINR: 0, openHour: 5, closeHour: 19, rating: 4.5, description: "Hilltop temple famous for sunrise over the Himalayas." },
      { name: "Shivpuri Camping", category: "adventure", indoor: false, lat: 30.1667, lng: 78.35, durationMinutes: 120, costPerPersonINR: 700, openHour: 10, closeHour: 18, rating: 4.3, description: "Riverside camping and cliff jumping spot." },
      { name: "Parmarth Market", category: "market", indoor: false, lat: 30.1142, lng: 78.3203, durationMinutes: 60, costPerPersonINR: 300, openHour: 10, closeHour: 21, rating: 4.0, description: "Small market for yoga wear, malas and incense." },
      { name: "Patanjali Yogpeeth", category: "nature", indoor: true, lat: 29.9947, lng: 78.0817, durationMinutes: 90, costPerPersonINR: 0, openHour: 9, closeHour: 17, rating: 4.1, description: "Large yoga and wellness institute campus." },
    ] as Omit<Place, "id" | "cityId">[]
  ).map((p, i) => place({ ...p, cityId: "rishikesh" }, "rishikesh", i + 1)),
];

function hotel(h: Omit<Hotel, "id">, cityId: string, idx: number): Hotel {
  return { id: `${cityId}-h${idx}`, ...h };
}

export const HOTELS: Hotel[] = [
  ...(
    [
      { name: "Lake Pichola Heritage Haveli", lat: 24.5775, lng: 73.6822, pricePerNightINR: 4200, rating: 4.5 },
      { name: "Udaipur Comfort Inn", lat: 24.585, lng: 73.695, pricePerNightINR: 2200, rating: 4.1 },
      { name: "Fateh Sagar Residency", lat: 24.594, lng: 73.688, pricePerNightINR: 3000, rating: 4.3 },
    ] as Omit<Hotel, "id" | "cityId">[]
  ).map((h, i) => hotel({ ...h, cityId: "udaipur" }, "udaipur", i + 1)),
  ...(
    [
      { name: "Baga Beach Resort", lat: 15.555, lng: 73.751, pricePerNightINR: 3800, rating: 4.2 },
      { name: "Calangute Sea View Inn", lat: 15.544, lng: 73.754, pricePerNightINR: 2400, rating: 4.0 },
      { name: "Panjim Heritage Stay", lat: 15.499, lng: 73.826, pricePerNightINR: 2800, rating: 4.3 },
    ] as Omit<Hotel, "id" | "cityId">[]
  ).map((h, i) => hotel({ ...h, cityId: "goa" }, "goa", i + 1)),
  ...(
    [
      { name: "Pink City Palace Hotel", lat: 26.922, lng: 75.826, pricePerNightINR: 3600, rating: 4.4 },
      { name: "Jaipur Budget Stay", lat: 26.915, lng: 75.82, pricePerNightINR: 1800, rating: 3.9 },
      { name: "Amber View Resort", lat: 26.98, lng: 75.85, pricePerNightINR: 3200, rating: 4.2 },
    ] as Omit<Hotel, "id" | "cityId">[]
  ).map((h, i) => hotel({ ...h, cityId: "jaipur" }, "jaipur", i + 1)),
  ...(
    [
      { name: "Old Manali Riverside Cottage", lat: 32.251, lng: 77.175, pricePerNightINR: 2600, rating: 4.4 },
      { name: "Mall Road Manali Inn", lat: 32.24, lng: 77.189, pricePerNightINR: 2000, rating: 4.0 },
      { name: "Solang View Resort", lat: 32.3, lng: 77.16, pricePerNightINR: 3400, rating: 4.3 },
    ] as Omit<Hotel, "id" | "cityId">[]
  ).map((h, i) => hotel({ ...h, cityId: "manali" }, "manali", i + 1)),
  ...(
    [
      { name: "Ganga View Ashram Stay", lat: 30.122, lng: 78.327, pricePerNightINR: 1600, rating: 4.2 },
      { name: "Laxman Jhula Riverside Hotel", lat: 30.121, lng: 78.326, pricePerNightINR: 2400, rating: 4.3 },
      { name: "Rishikesh Yoga Retreat", lat: 30.113, lng: 78.32, pricePerNightINR: 2800, rating: 4.4 },
    ] as Omit<Hotel, "id" | "cityId">[]
  ).map((h, i) => hotel({ ...h, cityId: "rishikesh" }, "rishikesh", i + 1)),
];

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}

export function getPlacesForCity(cityId: string): Place[] {
  return PLACES.filter((p) => p.cityId === cityId);
}

export function getHotelsForCity(cityId: string): Hotel[] {
  return HOTELS.filter((h) => h.cityId === cityId);
}

export function getPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}
