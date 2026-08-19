// seed.js
const { db } = require('./config/firebase');

async function seedData() {
console.log('Seeding initial NutriQueue test data...');

  // 1. Seed Stall Information
const stallRef = db.collection('stalls').doc('stall_001');
await stallRef.set({
    name: 'GSU Central Stall A',
    location: 'Main Canteen Counter 1',
    isOpen: true,
});

  // 2. Seed Stall Menu Items
await stallRef.collection('menu').doc('item_001').set({
    name: 'Grilled Chicken Breast',
    price: 85,
    isAvailable: true,
    ingredients: ['chicken', 'garlic', 'black pepper', 'soy sauce'],
    sodiumContent: 'low',
    purineContent: 'medium',
});

await stallRef.collection('menu').doc('item_002').set({
    name: 'Salty Pork Monggo',
    price: 50,
    isAvailable: true,
    ingredients: ['pork', 'monggo beans', 'spinach', 'salt'],
    sodiumContent: 'high',
    purineContent: 'high',
});

  // 3. Seed Student Clinic Profile
await db.collection('clinic_profiles').doc('2026-GSU-0123').set({
    studentId: '2026-GSU-0123',
    medicalConditions: ['Hypertension', 'Gout'],
    restrictedIngredients: ['high-sodium', 'high-purine'],
});

console.log('Successfully seeded stalls, menus, and clinic profiles!');
process.exit(0);
}

seedData().catch((err) => {
console.error('Error seeding data:', err);
process.exit(1);
});