const admin = require('firebase-admin');

// Try to initialize Firebase Admin with a local service account. If that fails
// (missing file, invalid creds, or environment restrictions), export a
// lightweight mock that prevents the app from crashing during local testing.
let db;
let messaging;
try {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
  messaging = admin.messaging();
} catch (err) {
  console.warn('Firebase initialization failed — using mock DB for local testing:', err && err.message);
  // Minimal mock to satisfy route usage during local tests. Provides a
  // chainable `where()` and `get()` that return an empty snapshot.
  const emptySnapshot = { size: 0, docs: [] };

  // Construct a chainable mock query object
  const makeQuery = () => {
    const q = {
      where: function () { return q; },
      get: async function () { return emptySnapshot; },
      orderBy: function () { return q; },
      limit: function () { return q; },
      doc: function (id) {
        return {
          get: async () => ({ exists: false }),
          collection: () => ({ where: () => ({ get: async () => emptySnapshot }) })
        };
      }
    };
    return q;
  };

  const mockCollection = (name) => makeQuery();

  // db should be a function and also have a `collection` method to mimic Firestore
  const dbFunc = function (name) { return mockCollection(name); };
  dbFunc.collection = mockCollection;
  db = dbFunc;
  messaging = { send: async () => null };
}

module.exports = { db, messaging };