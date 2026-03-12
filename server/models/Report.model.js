const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    enum: ['farmer', 'retailer'],
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  contactId: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  incidentDate: {
    type: Date
  },
  reasons: [{
    type: String,
    enum: [
      'counterfeit_products',
      'quality_breach',
      'financial_fraud',
      'contract_violation',
      'safety_concern',
      'other'
    ]
  }],
  description: {
    type: String,
    required: true
  },
  amount: {
    currency: String,
    value: Number
  },
  evidence: [{
    url: String,
    publicId: String,
    type: String
  }],
  reporterInfo: {
    email: String,
    phone: String,
    name: String,
    relationship: String,
    anonymous: Boolean
  },
  status: {
    type: String,
    enum: ['pending', 'under-review', 'resolved', 'rejected'],
    default: 'pending'
  },
  referenceId: {
    type: String,
    unique: true
  },
  adminNotes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate reference ID before saving
reportSchema.pre('save', async function(next) {
  if (!this.referenceId) {
    const count = await mongoose.model('Report').countDocuments();
    this.referenceId = `REP-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);
