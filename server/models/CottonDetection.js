const mongoose = require('mongoose');

const cottonDetectionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CottonUser',
    index: true
  },
  firebase_uid: {
    type: String,
    index: true
  },
  image_url: {
    type: String,
    required: true,
    description: 'Cloudinary image URL'
  },
  image_public_id: {
    type: String,
    required: true,
    description: 'Cloudinary public ID for deletion purposes'
  },
  image_upload_time: {
    type: Date,
    default: Date.now
  },
  crop_name: {
    type: String,
    default: 'Cotton',
    enum: ['Cotton']
  },
  disease_name: {
    type: String,
    required: true,
    description: 'Detected disease name'
  },
  disease_category: {
    type: String,
    default: 'Unknown',
    enum: ['Fungal', 'Bacterial', 'Viral', 'Pest Attack', 'Nutrient Deficiency', 'Healthy', 'Unknown'],
    description: 'Category of disease'
  },
  severity_level: {
    type: String,
    required: true,
    enum: ['Healthy', 'Low', 'Medium', 'High', 'Mild', 'Moderate', 'Severe', 'Critical'],
    description: 'Disease severity assessment'
  },
  infection_stage: {
    type: String,
    default: 'Unknown',
    enum: ['Early', 'Mid', 'Advanced', 'Unknown'],
    description: 'Stage of infection progression'
  },
  confidence_score_percent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    description: 'AI model confidence percentage'
  },
  observed_symptoms: {
    type: [String],
    default: [],
    description: 'List of observed disease symptoms'
  },
  symptoms: {
    type: [String],
    default: [],
    description: 'List of detected symptoms (legacy field)'
  },
  chemical_control: {
    recommended_product: String,
    active_ingredient: String,
    dosage_per_liter: String,
    spray_interval_days: String,
    precautions: String
  },
  fertilizer_recommendation: {
    recommended_fertilizer: String,
    npk_ratio: String,
    micronutrients_needed: String,
    dosage_per_acre: String,
    application_method: String
  },
  organic_control: {
    method: String,
    ingredients_required: String,
    application_frequency: String
  },
  integrated_pest_management: {
    type: [String],
    default: []
  },
  irrigation_management_advice: String,
  soil_health_advice: String,
  expected_recovery_time: String,
  farmer_note_simple_language: String,
  recommendations: {
    type: [String],
    default: [],
    description: 'Treatment and prevention recommendations'
  },
  treatment_options: {
    type: [String],
    default: [],
    description: 'Available treatment options'
  },
  full_ai_response: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    description: 'Complete JSON response from Groq API'
  },
  analysis_metadata: {
    model_used: {
      type: String,
      default: 'groq-vision'
    },
    processing_time_ms: {
      type: Number,
      default: null
    },
    api_version: {
      type: String,
      default: null
    }
  },
  // ...existing code...
  user_notes: {
    type: String,
    default: null,
    description: 'Notes added by user'
  },
  is_saved: {
    type: Boolean,
    default: true,
    description: 'Whether the detection result is saved'
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'cotton_detections'
});

// Index for quick user history retrieval
cottonDetectionSchema.index({ user_id: 1, created_at: -1 });
cottonDetectionSchema.index({ firebase_uid: 1, created_at: -1 });

// Middleware to update updated_at
cottonDetectionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('CottonDetection', cottonDetectionSchema);
