const express = require('express');
const router  = express.Router();
const { updateUsername, updatePassword, updateProfile, createUser, updateUserEmail, adminUpdatePlayer, adminChangePassword } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// Self-service routes (authenticated users)
router.put('/update-username', protect, updateUsername);
router.put('/update-password', protect, updatePassword);
router.put('/update-profile',  protect, updateProfile);

// Admin-only routes
router.post('/',                   protect, adminOnly, createUser);
router.put('/:id/email',           protect, adminOnly, updateUserEmail);
router.put('/:id/admin-update',    protect, adminOnly, adminUpdatePlayer);
router.put('/:id/password',        protect, adminOnly, adminChangePassword);

module.exports = router;
