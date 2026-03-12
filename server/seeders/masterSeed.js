const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import models
const User = require('../models/User.model');
const Product = require('../models/Product.model');
const WasteProduct = require('../models/WasteProduct.model');
const News = require('../models/News.model');
const MarketPrice = require('../models/MarketPrice.model');

const masterSeed = async () => {
  try {
    console.log('🚀 Starting Master Seed Process...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear all collections
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await WasteProduct.deleteMany({});
    await News.deleteMany({});
    await MarketPrice.deleteMany({});
    console.log('✅ All collections cleared\n');
    
    // ==================== USERS ====================
    console.log('👥 Creating Users...');
    const users = [
      {
        name: 'Demo Farmer',
        email: 'farmer@demo.com',
        password: 'demo123',
        role: 'farmer',
        phone: '9876543210',
        farmDetails: {
          farmName: 'Green Valley Farm',
          totalLand: 10,
          location: {
            address: 'Village Road',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001'
          }
        }
      },
      {
        name: 'Demo Retailer',
        email: 'retailer@demo.com',
        password: 'demo123',
        role: 'retailer',
        phone: '9876543211',
        businessDetails: {
          businessName: 'Fresh Mart',
          storeType: 'Retail Store',
          operatingHours: '9 AM - 9 PM'
        }
      },
      {
        name: 'Demo Consumer',
        email: 'consumer@demo.com',
        password: 'demo123',
        role: 'consumer',
        phone: '9876543212'
      }
    ];
    
    // Create users one by one to trigger pre-save hooks for password hashing
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    const farmer = createdUsers.find(u => u.role === 'farmer');
    console.log(`✅ Created ${createdUsers.length} users\n`);
    
    // ==================== PRODUCTS ====================
    console.log('🛒 Creating Products...');
    const products = [
      // Vegetables (Using verified existing images)
      { name: 'Fresh Tomatoes', description: 'Organic red tomatoes', price: 45, category: 'vegetables', unit: 'kg', quantity: 100, images: [{ url: '/image/Broccoli.jpg' }], seller: farmer._id, organic: true },
      { name: 'Onions', description: 'Fresh onions', price: 35, category: 'vegetables', unit: 'kg', quantity: 150, images: [{ url: '/image/cabbage.jpeg' }], seller: farmer._id },
      { name: 'Potatoes', description: 'Farm fresh potatoes', price: 25, category: 'vegetables', unit: 'kg', quantity: 200, images: [], seller: farmer._id },
      { name: 'Carrots', description: 'Organic carrots', price: 40, category: 'vegetables', unit: 'kg', quantity: 80, images: [{ url: '/image/carrot.jpeg' }], seller: farmer._id, organic: true },
      { name: 'Cabbage', description: 'Fresh green cabbage', price: 30, category: 'vegetables', unit: 'kg', quantity: 60, images: [{ url: '/image/cabbage.jpeg' }], seller: farmer._id },
      { name: 'Cauliflower', description: 'White cauliflower', price: 35, category: 'vegetables', unit: 'kg', quantity: 70, images: [{ url: '/image/cauliflower.jpeg' }], seller: farmer._id },
      { name: 'Broccoli', description: 'Fresh broccoli', price: 60, category: 'vegetables', unit: 'kg', quantity: 50, images: [{ url: '/image/Broccoli.jpg' }], seller: farmer._id, organic: true },
      { name: 'Cucumber', description: 'Green cucumber', price: 30, category: 'vegetables', unit: 'kg', quantity: 90, images: [{ url: '/image/cucumber.jpeg' }], seller: farmer._id },
      { name: 'Capsicum', description: 'Bell peppers', price: 50, category: 'vegetables', unit: 'kg', quantity: 60, images: [{ url: '/image/cpasicum.jpeg' }], seller: farmer._id },
      { name: 'Spinach', description: 'Fresh leafy spinach', price: 35, category: 'vegetables', unit: 'kg', quantity: 40, images: [{ url: '/image/cucumber.jpeg' }], seller: farmer._id, organic: true },
      { name: 'Garlic', description: 'Fresh garlic bulbs', price: 80, category: 'vegetables', unit: 'kg', quantity: 50, images: [{ url: '/image/garlic.jpeg' }], seller: farmer._id },
      { name: 'Ginger', description: 'Fresh ginger root', price: 70, category: 'vegetables', unit: 'kg', quantity: 60, images: [{ url: '/image/Ginger.jpeg' }], seller: farmer._id },
      
      // Fruits
      { name: 'Apples', description: 'Fresh red apples', price: 120, category: 'fruits', unit: 'kg', quantity: 100, images: [{ url: '/image/apple.jpeg' }], seller: farmer._id },
      { name: 'Bananas', description: 'Ripe yellow bananas', price: 50, category: 'fruits', unit: 'dozen', quantity: 150, images: [{ url: '/image/Banan.jpeg' }], seller: farmer._id },
      { name: 'Mangoes', description: 'Sweet mangoes', price: 100, category: 'fruits', unit: 'kg', quantity: 80, images: [{ url: '/image/mango.jpeg' }], seller: farmer._id },
      { name: 'Grapes', description: 'Fresh grapes', price: 90, category: 'fruits', unit: 'kg', quantity: 70, images: [{ url: '/image/Grapes.jpeg' }], seller: farmer._id },
      { name: 'Pomegranate', description: 'Fresh pomegranate', price: 110, category: 'fruits', unit: 'kg', quantity: 60, images: [{ url: '/image/Pomegranate.jpeg' }], seller: farmer._id, organic: true },
      { name: 'Guava', description: 'Fresh guava', price: 60, category: 'fruits', unit: 'kg', quantity: 90, images: [{ url: '/image/gauva.jpeg' }], seller: farmer._id },
      { name: 'Pineapple', description: 'Sweet pineapple', price: 50, category: 'fruits', unit: 'piece', quantity: 40, images: [{ url: '/image/Pineapple.jpeg' }], seller: farmer._id },
      { name: 'Kiwi', description: 'Fresh kiwi fruit', price: 200, category: 'fruits', unit: 'kg', quantity: 30, images: [{ url: '/image/kivi.jpeg' }], seller: farmer._id },
      
      // Cereals & Pulses
      { name: 'Wheat', description: 'Premium wheat grains', price: 2500, category: 'cereals', unit: 'quintal', quantity: 50, images: [{ url: '/image/dari.jpeg' }], seller: farmer._id },
      { name: 'Rice', description: 'Basmati rice', price: 3200, category: 'cereals', unit: 'quintal', quantity: 40, images: [{ url: '/image/dari.jpeg' }], seller: farmer._id, certified: true },
      { name: 'Lentils', description: 'Red lentils', price: 120, category: 'pulses', unit: 'kg', quantity: 100, images: [{ url: '/image/Pulses.jpeg' }], seller: farmer._id },
      { name: 'Chickpeas', description: 'Kabuli chana', price: 100, category: 'pulses', unit: 'kg', quantity: 80, images: [{ url: '/image/Pulses.jpeg' }], seller: farmer._id },
      
      // Spices
      { name: 'Turmeric', description: 'Pure turmeric powder', price: 180, category: 'spices', unit: 'kg', quantity: 50, images: [{ url: '/image/Seasoning.jpeg' }], seller: farmer._id, organic: true },
      { name: 'Cumin Seeds', description: 'Whole cumin seeds', price: 250, category: 'spices', unit: 'kg', quantity: 40, images: [{ url: '/image/cumin.jpeg' }], seller: farmer._id },
      
      // Others
      { name: 'Almonds', description: 'Premium almonds', price: 600, category: 'other', unit: 'kg', quantity: 30, images: [{ url: '/image/almonds.jpeg' }], seller: farmer._id },
      { name: 'Cashews', description: 'Whole cashew nuts', price: 700, category: 'other', unit: 'kg', quantity: 25, images: [{ url: '/image/cashew.jpeg' }], seller: farmer._id }
    ];
    
    await Product.insertMany(products);
    console.log(`✅ Created ${products.length} products\n`);
    
    // ==================== WASTE PRODUCTS ====================
    console.log('♻️  Creating Waste Products...');
    const wasteProducts = [
      { name: 'Organic Compost', description: 'High-quality compost from crop residues', category: 'Organic', price: 15, unit: 'kg', quantity: 500, image: '/image/Crop Residue.jpg', seller: farmer._id },
      { name: 'Vermicompost', description: 'Premium vermicompost for organic farming', category: 'Organic', price: 25, unit: 'kg', quantity: 300, image: '/image/Vegetable Waste.jpg', seller: farmer._id },
      { name: 'Biogas Slurry', description: 'Nutrient-rich biogas slurry fertilizer', category: 'Fertilizer', price: 10, unit: 'kg', quantity: 1000, image: '/image/weast.jpg', seller: farmer._id },
      { name: 'Crop Residue Mulch', description: 'Shredded crop residues for mulching', category: 'Mulch', price: 8, unit: 'kg', quantity: 800, image: '/image/Crop Residue.jpg', seller: farmer._id },
      { name: 'Rice Husk', description: 'Agricultural waste - rice processing byproduct', category: 'Other', price: 3, unit: 'kg', quantity: 5000, image: '/image/woodchips.jpg', seller: farmer._id },
      { name: 'Food Peels Compost', description: 'Compost from vegetable and fruit peels', category: 'Organic', price: 12, unit: 'kg', quantity: 400, image: '/image/food peels.jpg', seller: farmer._id }
    ];
    
    await WasteProduct.insertMany(wasteProducts);
    console.log(`✅ Created ${wasteProducts.length} waste products\n`);
    
    // ==================== NEWS ====================
    console.log('📰 Creating News Articles...');
    const news = [
      { title: 'Government Announces New Subsidy Scheme for Farmers', summary: 'The government has launched a new subsidy program to support small and marginal farmers.', content: 'In a major relief to farmers, the government today announced a comprehensive subsidy scheme...', category: 'Policy', image: '/image/govement.jpeg', tags: ['subsidy', 'government', 'farmers'], isPublished: true },
      { title: 'Organic Farming: The Future of Agriculture', summary: 'Experts discuss how organic farming practices can revolutionize agriculture.', content: 'Organic farming is gaining momentum as farmers and consumers recognize its benefits...', category: 'Agriculture', image: '/image/future.jpeg', tags: ['organic', 'sustainable'], isPublished: true },
      { title: 'AI Technology Transforming Crop Disease Detection', summary: 'New AI-powered tools are helping farmers detect crop diseases early.', content: 'Artificial Intelligence is revolutionizing agriculture with advanced crop disease detection...', category: 'Technology', image: '/image/agricultural-apps-for-farmers-1024x574.jpg', tags: ['AI', 'technology'], isPublished: true },
      { title: 'Market Prices Show Upward Trend for Vegetables', summary: 'Vegetable prices have increased by 15% this month.', content: 'The wholesale market has witnessed a significant increase in vegetable prices...', category: 'Market', image: '/image/market.jpeg', tags: ['market', 'prices'], isPublished: true },
      { title: 'Monsoon Forecast: Normal Rainfall Expected', summary: 'Meteorological department predicts normal monsoon rainfall this year.', content: 'The India Meteorological Department has forecasted normal monsoon rainfall...', category: 'Weather', image: '/image/News.jpeg', tags: ['monsoon', 'weather'], isPublished: true }
    ];
    
    await News.insertMany(news);
    console.log(`✅ Created ${news.length} news articles\n`);
    
    // ==================== MARKET PRICES ====================
    console.log('💰 Creating Market Prices...');
    const marketPrices = [
      { productName: 'Tomato', category: 'Vegetables', currentPrice: 45, previousPrice: 40, unit: 'kg', market: 'Azadpur Mandi', state: 'Delhi', district: 'North Delhi' },
      { productName: 'Onion', category: 'Vegetables', currentPrice: 35, previousPrice: 38, unit: 'kg', market: 'Vashi APMC', state: 'Maharashtra', district: 'Mumbai' },
      { productName: 'Potato', category: 'Vegetables', currentPrice: 25, previousPrice: 22, unit: 'kg', market: 'Koyambedu Market', state: 'Tamil Nadu', district: 'Chennai' },
      { productName: 'Apple', category: 'Fruits', currentPrice: 120, previousPrice: 115, unit: 'kg', market: 'Azadpur Mandi', state: 'Delhi', district: 'North Delhi' },
      { productName: 'Banana', category: 'Fruits', currentPrice: 50, previousPrice: 48, unit: 'dozen', market: 'Koyambedu Market', state: 'Tamil Nadu', district: 'Chennai' },
      { productName: 'Wheat', category: 'Grains', currentPrice: 2500, previousPrice: 2450, unit: 'quintal', market: 'Khanna Mandi', state: 'Punjab', district: 'Ludhiana' },
      { productName: 'Rice', category: 'Grains', currentPrice: 3200, previousPrice: 3150, unit: 'quintal', market: 'Guntur Market', state: 'Andhra Pradesh', district: 'Guntur' },
      { productName: 'Turmeric', category: 'Spices', currentPrice: 180, previousPrice: 175, unit: 'kg', market: 'Erode Market', state: 'Tamil Nadu', district: 'Erode' }
    ];
    
    await MarketPrice.insertMany(marketPrices);
    console.log(`✅ Created ${marketPrices.length} market prices\n`);
    
    // ==================== SUMMARY ====================
    console.log('\n========================================');
    console.log('✅ MASTER SEED COMPLETED SUCCESSFULLY!');
    console.log('========================================\n');
    
    console.log('📊 Database Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Waste Products: ${wasteProducts.length}`);
    console.log(`   News Articles: ${news.length}`);
    console.log(`   Market Prices: ${marketPrices.length}`);
    console.log(`   Total Records: ${createdUsers.length + products.length + wasteProducts.length + news.length + marketPrices.length}\n`);
    
    console.log('🔐 Demo Login Credentials:');
    console.log('   Farmer:   farmer@demo.com / demo123');
    console.log('   Retailer: retailer@demo.com / demo123');
    console.log('   Consumer: consumer@demo.com / demo123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
};

masterSeed();
