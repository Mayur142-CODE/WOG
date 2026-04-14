const express = require('express');
const router = express.Router();
const { getPlayers, createPlayer, reorderPlayers, updatePlayer, deletePlayer } = require('../controllers/playerController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/',          protect, getPlayers);
router.post('/',         protect, adminOnly, createPlayer);
router.put('/reorder',   protect, adminOnly, reorderPlayers);
router.put('/:id',       protect, adminOnly, updatePlayer);
router.delete('/:id',    protect, adminOnly, deletePlayer);

module.exports = router;
