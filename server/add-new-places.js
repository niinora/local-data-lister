const { connect } = require('./db');

async function addNewPlaces() {
  try {
    console.log('Connecting to MongoDB...');
    const db = await connect();
    const collection = db.collection('items');
    
    // Check if places already exist to avoid duplicates
    const existingCount = await collection.countDocuments();
    console.log(`Current items in database: ${existingCount}`);
    
    console.log('Preparing to add new places...');
    const newPlaces = [
      {
        "name": "Golden Dragon",
        "type": "Restaurant",
        "details": "Authentic Chinese cuisine with a focus on Sichuan and Cantonese dishes. Family-owned for over 25 years with a cozy atmosphere."
      },
      {
        "name": "City Library",
        "type": "Public Space",
        "details": "Modern public library with extensive collection, free WiFi, study rooms, and regular community events. Open seven days a week."
      },
      {
        "name": "Mountain View Trail",
        "type": "Park",
        "details": "Scenic 3-mile hiking trail with stunning panoramic views of the valley. Features picnic areas, wildlife viewing spots, and interpretive signage."
      },
      {
        "name": "The Bean House",
        "type": "Cafe",
        "details": "Specialty coffee shop serving single-origin beans, house-made pastries, and light lunch options. Comfortable seating with outdoor patio."
      },
      {
        "name": "Tech Hub Coworking",
        "type": "Workspace",
        "details": "Modern coworking space with high-speed internet, meeting rooms, 24/7 access, and a vibrant community of professionals and entrepreneurs."
      },
      {
        "name": "Sunset Beach",
        "type": "Park",
        "details": "Beautiful lakefront beach with swimming area, volleyball courts, and rentable pavilions. Perfect for summer picnics and water activities."
      },
      {
        "name": "Farm Fresh Market",
        "type": "Shop",
        "details": "Year-round farmers market featuring local produce, artisanal foods, handcrafted goods and seasonal events. Open Wednesday through Sunday."
      },
      {
        "name": "Moonlight Cinema",
        "type": "Entertainment",
        "details": "Historic theater showing a mix of blockbusters, independent films, and classics. Features original art deco interior and gourmet concessions."
      },
      {
        "name": "Fitness Evolution",
        "type": "Gym",
        "details": "Full-service fitness center with state-of-the-art equipment, group classes, personal training, and spa facilities. Open 24 hours daily."
      },
      {
        "name": "Blooming Garden Nursery",
        "type": "Shop",
        "details": "Family-owned plant nursery specializing in native species, organic gardening supplies, and expert landscaping advice. Workshops offered monthly."
      }
    ];
    
    // Check for duplicates by name
    const existingNames = await collection.distinct('name');
    const placesToAdd = newPlaces.filter(place => !existingNames.includes(place.name));
    
    if (placesToAdd.length === 0) {
      console.log('All places already exist in the database.');
      return { success: true, added: 0, message: 'All places already exist' };
    }
    
    console.log(`Attempting to insert ${placesToAdd.length} new places...`);
    const result = await collection.insertMany(placesToAdd);
    console.log(`Success! ${result.insertedCount} new places added to the database.`);
    
    console.log('New places added:');
    placesToAdd.forEach((place, index) => {
      console.log(`${index + 1}. ${place.name} (${place.type})`);
    });
    
    return { success: true, added: result.insertedCount, places: placesToAdd };
  } catch (error) {
    console.error('Error adding places:', error);
    return { success: false, error: error.message };
  }
}

// Export the function for use in other files
module.exports = { addNewPlaces };

// Only run directly if this file is executed directly
if (require.main === module) {
  addNewPlaces().then(() => process.exit(0)).catch(() => process.exit(1));
}