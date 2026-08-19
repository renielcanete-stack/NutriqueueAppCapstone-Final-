const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Route: GET /api/health/profile/:studentId
// Description: Cross-reference university clinic database for allergies
router.get('/profile/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // In production, this might act as a secure proxy API call to the actual university clinic system.
        // Here, we query a 'clinic_profiles' collection in Firestore acting as our synchronized replica.
        const profileRef = db.collection('clinic_profiles').doc(studentId);
        const profileDoc = await profileRef.get();

        if (!profileDoc.exists) {
            // Return an empty profile safe-state if no data exists
            return res.status(200).json({
                studentId,
                allergies: [],
                dietaryRestrictions: "None"
            });
        }

        res.status(200).json(profileDoc.data());
    } catch (error) {
        console.error("Health Profile Error:", error);
        res.status(500).json({ error: "Failed to fetch health profile" });
    }
});

module.exports = router;