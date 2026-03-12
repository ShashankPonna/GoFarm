const MarketPriceHistory = require('../models/MarketPriceHistory.model');

/**
 * Market Intelligence Utility Functions
 * Calculates trend, volatility, risk, best selling window from historical mandi prices
 */

// 1) Get historical prices for a crop in a district over N days
async function getHistoricalPrices(crop, state, district, days = 90) {
    const query = {
        cropName: { $regex: new RegExp(crop, 'i') }
    };

    if (days) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query.date = { $gte: startDate };
    }

    if (district) query.district = { $regex: new RegExp(district, 'i') };
    if (state) query.state = { $regex: new RegExp(state, 'i') };

    let prices = await MarketPriceHistory.find(query)
        .sort({ date: 1 })
        .lean();

    // Fallback: if no data in date range, try without date filter
    if (prices.length === 0 && days) {
        delete query.date;
        prices = await MarketPriceHistory.find(query)
            .sort({ date: -1 })
            .limit(30)
            .lean();
        // Re-sort ascending for analysis
        prices.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return prices;
}

// 2) Calculate moving average from price data
function calculateMovingAverage(data) {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.price, 0);
    return Math.round(sum / data.length);
}

// 3) Calculate price trend (up / down / stable)
function calculatePriceTrend(data) {
    if (!data || data.length < 2) return { trend: 'stable', changePercent: 0 };

    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;

    if (changePercent > 3) return { trend: 'up', changePercent: Math.round(changePercent * 100) / 100 };
    if (changePercent < -3) return { trend: 'down', changePercent: Math.round(changePercent * 100) / 100 };
    return { trend: 'stable', changePercent: Math.round(changePercent * 100) / 100 };
}

// 4) Calculate price volatility (High / Medium / Low)
function calculateVolatility(data) {
    if (!data || data.length < 2) return { volatility: 'Low', stdDev: 0 };

    const prices = data.map(d => d.price);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const squaredDiffs = prices.map(p => Math.pow(p - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
    const stdDev = Math.sqrt(avgSquaredDiff);

    // Coefficient of variation (stdDev as % of mean)
    const cv = (stdDev / mean) * 100;

    let volatility;
    if (cv > 15) volatility = 'High';
    else if (cv > 7) volatility = 'Medium';
    else volatility = 'Low';

    return { volatility, stdDev: Math.round(stdDev), cv: Math.round(cv * 100) / 100 };
}

// 5) Calculate risk level based on trend + volatility
function calculateRiskLevel(trend, volatility) {
    const riskMatrix = {
        'up_Low': 'Low',
        'up_Medium': 'Low',
        'up_High': 'Medium',
        'stable_Low': 'Low',
        'stable_Medium': 'Medium',
        'stable_High': 'Medium',
        'down_Low': 'Medium',
        'down_Medium': 'High',
        'down_High': 'High'
    };

    return riskMatrix[`${trend}_${volatility}`] || 'Medium';
}

// 6) Calculate best selling window
function calculateBestSellingWindow(data, trend) {
    if (!data || data.length < 2) return { window: 'Insufficient data', action: 'hold' };

    const prices = data.map(d => d.price);
    const maxPrice = Math.max(...prices);
    const lastPrice = prices[prices.length - 1];
    const isNearPeak = lastPrice >= maxPrice * 0.95;

    if (isNearPeak) {
        return { window: 'Now (at peak)', action: 'sell' };
    }

    if (trend === 'up') {
        return { window: '3-5 days', action: 'hold' };
    }

    if (trend === 'down') {
        return { window: 'Immediately', action: 'sell' };
    }

    return { window: '1-3 days', action: 'hold' };
}

// 7) Generate recommendation message
function generateRecommendation(trend, volatility, riskLevel, sellingWindow) {
    if (sellingWindow.action === 'sell' && trend === 'down') {
        return 'Prices are declining. Sell your crop immediately to minimize losses.';
    }

    if (sellingWindow.action === 'sell') {
        return 'Prices are near their peak. This is the best time to sell your crop for maximum profit.';
    }

    if (trend === 'up' && volatility === 'Low') {
        return 'Prices are steadily rising with low volatility. Hold your crop for 3-5 days for better pricing.';
    }

    if (trend === 'up' && volatility === 'Medium') {
        return 'Prices are trending upward but showing moderate fluctuation. Consider selling within 3-5 days.';
    }

    if (trend === 'up' && volatility === 'High') {
        return 'Prices are rising but highly volatile. Consider partial selling to lock in some gains.';
    }

    if (trend === 'stable' && riskLevel === 'Low') {
        return 'Market is stable with low risk. You can hold for 1-3 days or sell at current prices.';
    }

    if (riskLevel === 'High') {
        return 'Market conditions are risky. Consider selling soon to avoid potential losses.';
    }

    return 'Market conditions are moderate. Monitor prices daily and sell when you see a good opportunity.';
}

// Master function: compute full intelligence
async function computeMarketIntelligence(crop, state, district) {
    const data = await getHistoricalPrices(crop, state, district, 90);

    if (!data || data.length === 0) {
        return null;
    }

    const currentPrice = data[data.length - 1].price;
    const sevenDayAverage = calculateMovingAverage(data);
    const { trend, changePercent } = calculatePriceTrend(data);
    const { volatility, stdDev, cv } = calculateVolatility(data);
    const riskLevel = calculateRiskLevel(trend, volatility);
    const sellingWindow = calculateBestSellingWindow(data, trend);
    const recommendation = generateRecommendation(trend, volatility, riskLevel, sellingWindow);

    // Build chart data
    const chartData = data.map(d => ({
        date: d.date,
        price: d.price,
        mandi: d.mandiName
    }));

    return {
        cropName: crop,
        state,
        district,
        currentPrice,
        sevenDayAverage,
        trend,
        changePercent,
        volatility,
        stdDeviation: stdDev,
        coefficientOfVariation: cv,
        riskLevel,
        bestSellingWindow: sellingWindow.window,
        sellAction: sellingWindow.action,
        recommendation,
        chartData,
        dataPoints: data.length,
        lastUpdated: data[data.length - 1].date
    };
}

module.exports = {
    getHistoricalPrices,
    calculateMovingAverage,
    calculatePriceTrend,
    calculateVolatility,
    calculateRiskLevel,
    calculateBestSellingWindow,
    generateRecommendation,
    computeMarketIntelligence
};
