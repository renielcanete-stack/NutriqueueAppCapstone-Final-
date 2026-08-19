const admin = require('firebase-admin');

// Bypass console restriction using local emulator mode
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

admin.initializeApp({
  projectId: 'nutriqueue-demo-project'
});

const db = admin.firestore();
console.log('Firebase Admin initialized in LOCAL EMULATOR mode.');

module.exports = { db, messaging: null };
