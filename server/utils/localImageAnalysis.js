const sharp = require('sharp');

/**
 * Analyze image buffer to estimate plant health heuristically.
 * Returns an object { isHealthy: boolean, confidence: 0-100, details: {...} }
 */
const analyzeBuffer = async (buffer) => {
  try {
    // Resize for faster processing and get raw RGB
    const size = 256;
    const { data, info } = await sharp(buffer)
      .resize(size, size, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    if (channels < 3) throw new Error('Image must have at least 3 channels');

    // Compute simple vegetation index (Excess Green) and brown pixel ratio
    let exgSum = 0;
    let exgPosCount = 0;
    let brownCount = 0;
    const totalPixels = width * height;
    let exgValues = [];

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Normalize to [0,1]
      const rn = r / 255;
      const gn = g / 255;
      const bn = b / 255;

      // Excess Green: 2G - R - B
      const exg = 2 * gn - rn - bn;
      exgValues.push(exg);
      exgSum += exg;
      if (exg > 0.02) exgPosCount++;

      // Brown detection heuristic: red and low green
      if (rn > 0.35 && gn < 0.3 && rn - gn > 0.15) brownCount++;
    }

    const avgExg = exgSum / totalPixels;
    const percentGreenish = (exgPosCount / totalPixels) * 100;
    const percentBrown = (brownCount / totalPixels) * 100;

    // Spotiness measure: std dev of ExG
    const mean = avgExg;
    let variance = 0;
    for (let v of exgValues) variance += Math.pow(v - mean, 2);
    variance = variance / exgValues.length;
    const stdExg = Math.sqrt(variance);

    // Heuristic health score (0..1) - higher means healthier
    // weights: green coverage positive, brown negative, spotiness negative
    const greenScore = Math.min(1, percentGreenish / 60); // 60% greenish is ideal
    const brownPenalty = Math.min(1, percentBrown / 30); // 30% brown is bad
    const spotPenalty = Math.min(1, stdExg / 0.15); // tuned

    let healthScore = greenScore * 0.65 - brownPenalty * 0.25 - spotPenalty * 0.1;
    healthScore = Math.max(-1, Math.min(1, healthScore));

    // Map to confidence 0-100
    const confidence = Math.round(((healthScore + 1) / 2) * 100);

    const isHealthy = healthScore > 0.15; // threshold

    return {
      isHealthy,
      confidence,
      details: {
        width,
        height,
        percentGreenish: Number(percentGreenish.toFixed(2)),
        percentBrown: Number(percentBrown.toFixed(2)),
        avgExg: Number(avgExg.toFixed(4)),
        stdExg: Number(stdExg.toFixed(4)),
        healthScore: Number(healthScore.toFixed(4))
      }
    };
  } catch (error) {
    return {
      isHealthy: false,
      confidence: 0,
      details: { error: error.message }
    };
  }
};

module.exports = {
  analyzeBuffer
};
