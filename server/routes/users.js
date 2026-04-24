const express = require('express');
const router  = express.Router();
const { updateUsername, updatePassword, createUser, updateUserEmail } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// Self-service routes (authenticated users)
router.put('/update-username', protect, updateUsername);
router.put('/update-password', protect, updatePassword);

// Admin-only routes
router.post('/',          protect, adminOnly, createUser);
router.put('/:id/email',  protect, adminOnly, updateUserEmail);

module.exports = router;
