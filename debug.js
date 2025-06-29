const { connect } = require('./server/db');
const express = require('express');

async function debugApplication() {
    console.log('🔍 Debugging Local Data Lister...\n');
    
    // Test 1: Database Connection
    console.log('1. Testing database connection...');
    try {
        const db = await connect();
        console.log('✅ Database connected successfully');
        
        const collection = db.collection('items');
        const count = await collection.countDocuments();
        console.log(`📊 Items in database: ${count}`);
        
        if (count > 0) {
            const sample = await collection.findOne();
            console.log('📄 Sample item:', JSON.stringify(sample, null, 2));
        }
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        return;
    }
    
    // Test 2: Check required files
    console.log('\n2. Checking required files...');
    const fs = require('fs');
    const files = [
        './index.html',
        './styles.css', 
        './script.js',
        './server/index.js'
    ];
    
    files.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} exists`);
        } else {
            console.log(`❌ ${file} missing`);
        }
    });
    
    // Test 3: Test API endpoint
    console.log('\n3. Testing API endpoint...');
    try {
        const response = await fetch('http://localhost:5000/api/items');
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ API working, returned ${data.length} items`);
        } else {
            console.log(`❌ API returned status: ${response.status}`);
        }
    } catch (error) {
        console.log('❌ API test failed - server might not be running');
        console.log('   Start server with: node server/index.js');
    }
    
    console.log('\n🏁 Debug complete');
}

debugApplication();
