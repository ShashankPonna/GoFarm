const cron = require('node-cron');
const axios = require('axios');
const MarketPriceHistory = require('../models/MarketPriceHistory.model');

const AGMARKNET_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

/**
 * Load sample market data for demonstration
 */
async function loadSampleData() {
    try {
        // Check if data already exists (high threshold so new crops get added)
        const existingCount = await MarketPriceHistory.countDocuments();
        if (existingCount > 10000) {
            console.log('📊 Sample data already exists in database');
            return { success: true, message: 'Sample data already loaded' };
        }

        console.log('📊 Loading sample market data...');

        // Define all crops with their base prices
        const crops = [
            { name: 'Rice', price: 2800, minPrice: 2700, maxPrice: 2900 },
            { name: 'Wheat', price: 2200, minPrice: 2100, maxPrice: 2300 },
            { name: 'Onion', price: 1800, minPrice: 1600, maxPrice: 2000 },
            { name: 'Tomato', price: 2400, minPrice: 2200, maxPrice: 2600 },
            { name: 'Potato', price: 1200, minPrice: 1000, maxPrice: 1400 },
            { name: 'Cotton', price: 6800, minPrice: 6500, maxPrice: 7100 },
            { name: 'Sugarcane', price: 320, minPrice: 300, maxPrice: 340 },
            { name: 'Maize', price: 1900, minPrice: 1800, maxPrice: 2000 },
            { name: 'Groundnut', price: 5200, minPrice: 5000, maxPrice: 5400 },
            { name: 'Soybean', price: 4100, minPrice: 3900, maxPrice: 4300 },
        ];

        // Define all locations — major agricultural mandis across India
        const locations = [

            // ===================== MAHARASHTRA (10 Districts) =====================
            { state: 'Maharashtra', district: 'Nashik', mandi: 'Nashik Mandi' },
            { state: 'Maharashtra', district: 'Pune', mandi: 'Pune APMC' },
            { state: 'Maharashtra', district: 'Dhule', mandi: 'Dhule Mandi' },
            { state: 'Maharashtra', district: 'Ahmednagar', mandi: 'Ahmednagar APMC' },
            { state: 'Maharashtra', district: 'Solapur', mandi: 'Solapur Mandi' },
            { state: 'Maharashtra', district: 'Kolhapur', mandi: 'Kolhapur APMC' },
            { state: 'Maharashtra', district: 'Nagpur', mandi: 'Nagpur Mandi' },
            { state: 'Maharashtra', district: 'Aurangabad', mandi: 'Aurangabad APMC' },
            { state: 'Maharashtra', district: 'Satara', mandi: 'Satara Mandi' },
            { state: 'Maharashtra', district: 'Sangli', mandi: 'Sangli APMC' },

            // ===================== KARNATAKA (5 Districts) =====================
            { state: 'Karnataka', district: 'Belagavi', mandi: 'Belagavi APMC' },
            { state: 'Karnataka', district: 'Bengaluru', mandi: 'Yeshwanthpur APMC' },
            { state: 'Karnataka', district: 'Mysuru', mandi: 'Mysuru APMC' },
            { state: 'Karnataka', district: 'Hubballi', mandi: 'Hubballi APMC' },
            { state: 'Karnataka', district: 'Davanagere', mandi: 'Davanagere APMC' },

            // ===================== MADHYA PRADESH (5 Districts) =====================
            { state: 'Madhya Pradesh', district: 'Indore', mandi: 'Indore Mandi' },
            { state: 'Madhya Pradesh', district: 'Bhopal', mandi: 'Bhopal Mandi' },
            { state: 'Madhya Pradesh', district: 'Jabalpur', mandi: 'Jabalpur Mandi' },
            { state: 'Madhya Pradesh', district: 'Ujjain', mandi: 'Ujjain Mandi' },
            { state: 'Madhya Pradesh', district: 'Gwalior', mandi: 'Gwalior Mandi' },

            // ===================== GUJARAT (5 Districts) =====================
            { state: 'Gujarat', district: 'Ahmedabad', mandi: 'Ahmedabad APMC' },
            { state: 'Gujarat', district: 'Rajkot', mandi: 'Rajkot APMC' },
            { state: 'Gujarat', district: 'Surat', mandi: 'Surat APMC' },
            { state: 'Gujarat', district: 'Vadodara', mandi: 'Vadodara APMC' },
            { state: 'Gujarat', district: 'Bhavnagar', mandi: 'Bhavnagar APMC' },

            // ===================== RAJASTHAN (5 Districts) =====================
            { state: 'Rajasthan', district: 'Jaipur', mandi: 'Jaipur Mandi' },
            { state: 'Rajasthan', district: 'Jodhpur', mandi: 'Jodhpur Mandi' },
            { state: 'Rajasthan', district: 'Kota', mandi: 'Kota Mandi' },
            { state: 'Rajasthan', district: 'Udaipur', mandi: 'Udaipur Mandi' },
            { state: 'Rajasthan', district: 'Bikaner', mandi: 'Bikaner Mandi' },

            // ===================== UTTAR PRADESH (5 Districts) =====================
            { state: 'Uttar Pradesh', district: 'Lucknow', mandi: 'Lucknow Mandi' },
            { state: 'Uttar Pradesh', district: 'Agra', mandi: 'Agra Mandi' },
            { state: 'Uttar Pradesh', district: 'Kanpur', mandi: 'Kanpur Mandi' },
            { state: 'Uttar Pradesh', district: 'Varanasi', mandi: 'Varanasi Mandi' },
            { state: 'Uttar Pradesh', district: 'Meerut', mandi: 'Meerut Mandi' },

            // ===================== PUNJAB (5 Districts) =====================
            { state: 'Punjab', district: 'Ludhiana', mandi: 'Ludhiana Mandi' },
            { state: 'Punjab', district: 'Amritsar', mandi: 'Amritsar Mandi' },
            { state: 'Punjab', district: 'Patiala', mandi: 'Patiala Mandi' },
            { state: 'Punjab', district: 'Jalandhar', mandi: 'Jalandhar Mandi' },
            { state: 'Punjab', district: 'Bathinda', mandi: 'Bathinda Mandi' },

            // ===================== HARYANA (5 Districts) =====================
            { state: 'Haryana', district: 'Karnal', mandi: 'Karnal Mandi' },
            { state: 'Haryana', district: 'Hisar', mandi: 'Hisar Mandi' },
            { state: 'Haryana', district: 'Rohtak', mandi: 'Rohtak Mandi' },
            { state: 'Haryana', district: 'Ambala', mandi: 'Ambala Mandi' },
            { state: 'Haryana', district: 'Sirsa', mandi: 'Sirsa Mandi' },

            // ===================== TAMIL NADU (5 Districts) =====================
            { state: 'Tamil Nadu', district: 'Chennai', mandi: 'Koyambedu Market' },
            { state: 'Tamil Nadu', district: 'Coimbatore', mandi: 'Coimbatore Market' },
            { state: 'Tamil Nadu', district: 'Madurai', mandi: 'Madurai Market' },
            { state: 'Tamil Nadu', district: 'Salem', mandi: 'Salem Market' },
            { state: 'Tamil Nadu', district: 'Erode', mandi: 'Erode Market' },

            // ===================== ANDHRA PRADESH (5 Districts) =====================
            { state: 'Andhra Pradesh', district: 'Guntur', mandi: 'Guntur Mandi' },
            { state: 'Andhra Pradesh', district: 'Kurnool', mandi: 'Kurnool Mandi' },
            { state: 'Andhra Pradesh', district: 'Vijayawada', mandi: 'Vijayawada Mandi' },
            { state: 'Andhra Pradesh', district: 'Anantapur', mandi: 'Anantapur Mandi' },
            { state: 'Andhra Pradesh', district: 'Nellore', mandi: 'Nellore Mandi' },
        ];

        // Build all crop x location combinations
        const sampleData = [];
        for (const crop of crops) {
            for (const loc of locations) {
                // Add slight price variance per location
                const locVariance = Math.floor(Math.random() * 150) - 75;
                sampleData.push({
                    crop: crop.name,
                    state: loc.state,
                    district: loc.district,
                    mandi: loc.mandi,
                    price: crop.price + locVariance,
                    minPrice: crop.minPrice + locVariance,
                    maxPrice: crop.maxPrice + locVariance,
                });
            }
        }

        let savedCount = 0;
        const now = new Date();

        for (const data of sampleData) {
            try {
                // Create multiple date entries for better analysis
                for (let i = 0; i < 30; i++) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    const variance = Math.floor(Math.random() * 200) - 100;

                    const dayStart = new Date(date);
                    dayStart.setHours(0, 0, 0, 0);
                    const dayEnd = new Date(date);
                    dayEnd.setHours(23, 59, 59, 999);

                    const exists = await MarketPriceHistory.findOne({
                        cropName: data.crop,
                        state: data.state,
                        district: data.district,
                        mandiName: data.mandi,
                        date: {
                            $gte: dayStart,
                            $lt: dayEnd
                        }
                    });

                    if (!exists) {
                        await MarketPriceHistory.create({
                            cropName: data.crop,
                            state: data.state,
                            district: data.district,
                            mandiName: data.mandi,
                            price: Math.max(100, data.price + variance),
                            minPrice: Math.max(100, data.minPrice + variance),
                            maxPrice: data.maxPrice + variance,
                            date: new Date(date)
                        });
                        savedCount++;
                    }
                }
            } catch (err) {
                console.error(`Error saving sample data for ${data.crop}:`, err.message);
            }
        }

        console.log(`✅ Sample data loaded: ${savedCount} records`);
        return { success: true, saved: savedCount, message: 'Sample market data loaded successfully' };
    } catch (error) {
        console.error('❌ Sample data loading error:', error.message);
        return { success: false, message: error.message };
    }
}

/**
 * Fetch latest mandi prices from Agmarknet API and store in MongoDB
 */
async function fetchAndStorePrices() {
    const apiKey = process.env.DATA_GOV_API_KEY;

    if (!apiKey) {
        console.warn('⚠️  DATA_GOV_API_KEY not set in .env — skipping mandi price fetch');
        return { success: false, message: 'API key not configured' };
    }

    try {
        console.log('📊 Fetching latest mandi prices from Agmarknet...');

        const response = await axios.get(AGMARKNET_API_URL, {
            params: {
                'api-key': apiKey,
                format: 'json',
                limit: 500,
                offset: 0
            },
            timeout: 30000
        });

        const records = response.data?.records;

        if (!records || records.length === 0) {
            console.log('ℹ️  No records returned from Agmarknet API');
            return { success: true, message: 'No records available', count: 0 };
        }

        let savedCount = 0;
        let skippedCount = 0;

        for (const record of records) {
            try {
                const cropName = record.commodity || record.Commodity;
                const state = record.state || record.State;
                const district = record.district || record.District;
                const mandiName = record.market || record.Market;
                const modalPrice = parseFloat(record.modal_price || record.Modal_Price || 0);
                const minPrice = parseFloat(record.min_price || record.Min_Price || 0);
                const maxPrice = parseFloat(record.max_price || record.Max_Price || 0);
                const arrivalDate = record.arrival_date || record.Arrival_Date;

                if (!cropName || !modalPrice || modalPrice <= 0) {
                    skippedCount++;
                    continue;
                }

                // Parse the arrival date (DD/MM/YYYY format from Agmarknet)
                let parsedDate;
                if (arrivalDate) {
                    const parts = arrivalDate.split('/');
                    if (parts.length === 3) {
                        parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    } else {
                        parsedDate = new Date(arrivalDate);
                    }
                } else {
                    parsedDate = new Date();
                }

                if (isNaN(parsedDate.getTime())) {
                    parsedDate = new Date();
                }

                // Check for duplicate before insert
                const exists = await MarketPriceHistory.findOne({
                    cropName,
                    state,
                    district,
                    mandiName,
                    date: parsedDate
                });

                if (!exists) {
                    await MarketPriceHistory.create({
                        cropName,
                        state,
                        district,
                        mandiName,
                        price: modalPrice,
                        minPrice,
                        maxPrice,
                        date: parsedDate
                    });
                    savedCount++;
                } else {
                    skippedCount++;
                }
            } catch (innerErr) {
                skippedCount++;
            }
        }

        console.log(`✅ Mandi prices updated: ${savedCount} new, ${skippedCount} skipped`);
        return { success: true, saved: savedCount, skipped: skippedCount };
    } catch (error) {
        console.error('❌ Agmarknet API fetch error:', error.message);
        return { success: false, message: error.message };
    }
}

/**
 * Start the daily cron job — runs at midnight every day
 */
function startMandiCronJob() {
    // Load sample data on startup if no data exists
    loadSampleData().catch(err => console.error('Failed to load sample data:', err));

    // Run daily at 00:00
    cron.schedule('0 0 * * *', async () => {
        console.log('\n⏰ [CRON] Daily mandi price fetch started...');
        const result = await fetchAndStorePrices();
        // If API fetch fails, load sample data
        if (!result.success) {
            await loadSampleData();
        }
        console.log('⏰ [CRON] Daily mandi price fetch complete.\n');
    });

    console.log('📅 Mandi price cron job scheduled (daily at midnight)');
}

module.exports = { fetchAndStorePrices, loadSampleData, startMandiCronJob };
