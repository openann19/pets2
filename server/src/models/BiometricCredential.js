/**
 * Biometric Credential Model
 * Stores WebAuthn biometric authentication credentials
 */

const mongoose = require('mongoose');

const biometricCredentialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  credentialId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // WebAuthn credential public key (base64url encoded)
  publicKey: {
    type: String,
    required: true
  },
  // WebAuthn signature counter (prevents replay attacks)
  counter: {
    type: Number,
    default: 0,
    min: 0
  },
  // Current challenge for this credential (used during authentication)
  currentChallenge: {
    type: String,
    default: null
  },
  // Transports supported by this authenticator
  transports: {
    type: [String],
    default: []
  },
  // Authenticator AAGUID
  aaguid: {
    type: String,
    default: null
  },
  // Credential device type (e.g., 'platform' or 'cross-platform')
  credentialDeviceType: {
    type: String,
    enum: ['singleDevice', 'multiDevice'],
    default: 'singleDevice'
  },
  // Whether credential is backed up
  credentialBackedUp: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
biometricCredentialSchema.index({ userId: 1, credentialId: 1 });
biometricCredentialSchema.index({ createdAt: -1 });

// Ensure only one credential per user
biometricCredentialSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('BiometricCredential', biometricCredentialSchema);
