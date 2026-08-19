const express = require('express');
const router = express.Router();
let tf;
try {
    tf = require('@tensorflow/tfjs-node');
} catch (err) {
    console.warn('Optional @tensorflow/tfjs-node not installed — using JS fallback for ML calculations');
    tf = null;
}
const { db } = require('../config/firebase');

// Route: POST /api/ml/predict-wait-time
// Description: Calculates estimated wait time based on active queue size and items
router.post('/predict-wait-time', async (req, res) => {
    try {
        const { stallId, itemsCount } = req.body;

        // 1. Fetch current active orders for the stall to calculate queue length
        const ordersSnapshot = await db.collection('orders')
            .where('stallId', '==', stallId)
            .where('status', 'in', ['pending', 'preparing'])
            .get();
        
        const queueLength = ordersSnapshot.size;

        // 2. Machine Learning Prediction Logic
        // If tfjs-node is available, use tensors; otherwise fall back to a simple JS formula.
        let estimatedWaitMinutes;
        if (tf) {
            // For production, you would load a trained model: await tf.loadLayersModel('file://model.json')
            const inputTensor = tf.tensor2d([[queueLength, itemsCount]]);
            const weightQueue = tf.scalar(2);
            const weightItems = tf.scalar(1);
            const queueTime = tf.mul(inputTensor.slice([0, 0], [1, 1]), weightQueue);
            const itemsTime = tf.mul(inputTensor.slice([0, 1], [1, 1]), weightItems);
            const estimatedWaitTensor = tf.add(queueTime, itemsTime);
            estimatedWaitMinutes = Array.from(estimatedWaitTensor.dataSync())[0];
        } else {
            // Fallback deterministic calculation: Wait = queueLength*2 + itemsCount*1
            estimatedWaitMinutes = (queueLength * 2) + (itemsCount * 1);
        }

        res.status(200).json({
            stallId,
            currentQueue: queueLength,
            itemsOrdered: itemsCount,
            estimatedWaitMinutes: Math.round(estimatedWaitMinutes)
        });
    } catch (error) {
        console.error("ML Prediction Error:", error);
        res.status(500).json({ error: "Failed to predict wait time" });
    }
});

module.exports = router;