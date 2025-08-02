#!/usr/bin/env node

/**
 * MongoDB Text Search Index Verification Script
 * 
 * This script verifies that the required text search indexes exist for clinic search functionality.
 * Run this script to check if your MongoDB indexes are properly configured.
 * 
 * Usage:
 * node scripts/verify-search-indexes.js
 * 
 * Requirements:
 * - MongoDB connection string in MONGODB_URI environment variable
 * - mongodb package installed
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'dentalcare'; // Adjust to your database name

async function verifySearchIndexes() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    console.log('Please set MONGODB_URI in your .env file');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const clinicsCollection = db.collection('clinics');

    // Check if collection exists and has documents
    const docCount = await clinicsCollection.countDocuments();
    console.log(`📊 Found ${docCount} clinic documents`);

    if (docCount === 0) {
      console.log('⚠️  No clinic documents found. Add some clinics first to test search.');
    }

    // List all indexes
    console.log('\\n📋 Current indexes on clinics collection:');
    const indexes = await clinicsCollection.listIndexes().toArray();
    
    let hasTextIndex = false;
    let hasGeoIndex = false;

    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`);
      console.log(`   Key: ${JSON.stringify(index.key)}`);
      if (index.weights) {
        console.log(`   Weights: ${JSON.stringify(index.weights)}`);
      }
      if (index.key._text) {
        hasTextIndex = true;
      }
      if (index.key.location === '2dsphere') {
        hasGeoIndex = true;
      }
      console.log('');
    });

    // Test text search functionality
    console.log('🔍 Testing text search functionality...');
    
    if (hasTextIndex) {
      try {
        const textSearchResult = await clinicsCollection.find({ 
          $text: { $search: 'dental' } 
        }).limit(3).toArray();
        
        console.log(`✅ Text search is working! Found ${textSearchResult.length} results for "dental"`);
        
        if (textSearchResult.length > 0) {
          console.log('Sample result:', {
            name: textSearchResult[0].name,
            address: textSearchResult[0].address,
            services: textSearchResult[0].services?.slice(0, 3)
          });
        }
      } catch (error) {
        console.log('❌ Text search failed:', error.message);
      }
    } else {
      console.log('❌ No text search index found');
    }

    // Test regex search fallback
    console.log('\\n🔍 Testing regex search fallback...');
    try {
      const regexSearchResult = await clinicsCollection.find({ 
        name: { $regex: 'dental', $options: 'i' } 
      }).limit(3).toArray();
      
      console.log(`✅ Regex search is working! Found ${regexSearchResult.length} results for "dental"`);
    } catch (error) {
      console.log('❌ Regex search failed:', error.message);
    }

    // Test geospatial functionality
    if (hasGeoIndex) {
      console.log('\\n🌍 Testing geospatial search...');
      try {
        const geoSearchResult = await clinicsCollection.find({
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [-74.0059, 40.7128] }, // NYC
              $maxDistance: 10000 // 10km
            }
          }
        }).limit(3).toArray();
        
        console.log(`✅ Geospatial search is working! Found ${geoSearchResult.length} results near NYC`);
      } catch (error) {
        console.log('❌ Geospatial search failed:', error.message);
      }
    } else {
      console.log('❌ No geospatial index found on location field');
    }

    // Recommendations
    console.log('\\n📝 Recommendations:');
    
    if (!hasTextIndex) {
      console.log('❌ Create text search index:');
      console.log(`
db.clinics.createIndex({
  "name": "text",
  "address": "text", 
  "locationDetails.formattedAddress": "text",
  "services": "text",
  "searchableAddress": "text"
}, {
  "weights": {
    "name": 10,
    "address": 5,
    "services": 3,
    "locationDetails.formattedAddress": 5,
    "searchableAddress": 2
  },
  "name": "clinic_text_search"
})`);
    } else {
      console.log('✅ Text search index exists');
    }

    if (!hasGeoIndex) {
      console.log('❌ Create geospatial index:');
      console.log('db.clinics.createIndex({ "location": "2dsphere" })');
    } else {
      console.log('✅ Geospatial index exists');
    }

    if (hasTextIndex && hasGeoIndex) {
      console.log('\\n🎉 All indexes are properly configured!');
      console.log('Your search functionality should work optimally.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\\n🔌 Disconnected from MongoDB');
  }
}

async function createMissingIndexes() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const clinicsCollection = db.collection('clinics');

    console.log('\\n🛠️  Creating missing indexes...');

    // Create text search index
    try {
      await clinicsCollection.createIndex({
        name: 'text',
        address: 'text',
        'locationDetails.formattedAddress': 'text',
        services: 'text',
        searchableAddress: 'text'
      }, {
        weights: {
          name: 10,
          address: 5,
          services: 3,
          'locationDetails.formattedAddress': 5,
          searchableAddress: 2
        },
        name: 'clinic_text_search',
        background: true
      });
      console.log('✅ Text search index created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Text search index already exists');
      } else {
        console.log('❌ Failed to create text search index:', error.message);
      }
    }

    // Create geospatial index
    try {
      await clinicsCollection.createIndex({ location: '2dsphere' });
      console.log('✅ Geospatial index created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Geospatial index already exists');
      } else {
        console.log('❌ Failed to create geospatial index:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await client.close();
  }
}

// Main execution
async function main() {
  console.log('🔍 MongoDB Search Index Verification Tool');
  console.log('==========================================\\n');

  const args = process.argv.slice(2);
  
  if (args.includes('--create') || args.includes('-c')) {
    await createMissingIndexes();
  }
  
  await verifySearchIndexes();
  
  if (!args.includes('--create') && !args.includes('-c')) {
    console.log('\\n💡 Tip: Run with --create flag to automatically create missing indexes');
    console.log('   node scripts/verify-search-indexes.js --create');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verifySearchIndexes, createMissingIndexes };