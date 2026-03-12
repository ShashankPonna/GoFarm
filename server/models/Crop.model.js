const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropName: {
    type: String,
    required: true,
    trim: true
  },
  plotName: {
    type: String,
    required: true
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  areaUnit: {
    type: String,
    enum: ['acres', 'hectares'],
    default: 'acres'
  },
  plantedDate: {
    type: Date,
    required: true
  },
  expectedHarvestDate: {
    type: Date,
    required: true
  },
  actualHarvestDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['planning', 'growing', 'harvesting', 'harvested', 'failed'],
    default: 'planning'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  expectedYield: {
    type: Number,
    min: 0
  },
  actualYield: {
    type: Number,
    min: 0
  },
  yieldUnit: {
    type: String,
    enum: ['kg', 'quintal', 'ton'],
    default: 'kg'
  },
  diseaseDetections: [{
    detectedAt: Date,
    diseaseName: String,
    confidence: Number,
    severity: String,
    image: String,
    treatment: String
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Crop', cropSchema);
