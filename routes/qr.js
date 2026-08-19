const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Route: POST /api/qr/route-stall
// Description: Returns stall information and active menu when a user scans a QR
router.post('/route-stall', async (req, res) => {
    try {
        const { stallId } = req.body;
        
        if (!stallId) return res.status(400).json({ error: "Stall ID is required" });

        const stallRef = db.collection('stalls').doc(stallId);
        const stallDoc = await stallRef.get();

        if (!stallDoc.exists) return res.status(404).json({ error: "Stall not found" });

        // Fetch available menus for this specific stall
        const menuSnapshot = await stallRef.collection('menu').where('isAvailable', '==', true).get();
        const menu = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({
            stall: { id: stallDoc.id, ...stallDoc.data() },
            menu: menu
        });
    } catch (error) {
        console.error("QR Route Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;