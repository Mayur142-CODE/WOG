const express = require('express');
const router = express.Router();
const { getScrims, createScrim, updateScrim, deleteScrim } = require('../controllers/scrimController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/',      protect, getScrims);
router.post('/',     protect, adminOnly, createScrim);
router.put('/:id',   protect, adminOnly, updateScrim);
router.delete('/:id',protect, adminOnly, deleteScrim);

module.exports = router;
