const express = require('express');
const router = express.Router();
const { getSummary, resetTurn } = require('../controllers/summaryController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/',             protect, getSummary);
router.post('/reset-turn',  protect, adminOnly, resetTurn);

module.exports = router;
