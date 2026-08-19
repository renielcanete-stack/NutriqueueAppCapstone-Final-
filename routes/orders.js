const express = require('express');
const router = express.Router();
const { db, messaging } = require('../config/firebase');

// Route: POST /api/orders
// Description: Place a new order from the student app
router.post('/', async (req, res) => {
    try {
        const { studentId, stallId, items, totalAmount, fcmToken } = req.body;

        const orderData = {
            studentId,
            stallId,
            items,
            totalAmount,
            status: 'pending', // Initial status
            createdAt: new Date().toISOString(),
            fcmToken: fcmToken || null
        };

        const orderRef = await db.collection('orders').add(orderData);

        // Optional: Send initial FCM Push Notification confirming placement
        if (fcmToken) {
            await messaging.send({
                token: fcmToken,
                notification: {
                    title: 'NutriQueue Order Received',
                    body: `Your order has been placed successfully and is pending.`
                }
            });
        }

        res.status(201).json({ orderId: orderRef.id, message: "Order placed successfully" });
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ error: "Failed to place order" });
    }
});

// Route: PATCH /api/orders/:id/status
// Description: Vendor updates order status (e.g., to 'ready' or 'completed')
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const orderRef = db.collection('orders').doc(id);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) return res.status(404).json({ error: "Order not found" });

        await orderRef.update({ status, updatedAt: new Date().toISOString() });

        // Push Notification Trigger: Notify student when food is ready
        if (status === 'ready' && orderDoc.data().fcmToken) {
            await messaging.send({
                token: orderDoc.data().fcmToken,
                notification: {
                    title: 'Food is Ready! 🍲',
                    body: `Your order from Stall ${orderDoc.data().stallId} is ready for pickup.`
                }
            });
        }

        res.status(200).json({ message: `Order status updated to ${status}` });
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ error: "Failed to update status" });
    }
});

module.exports = router;