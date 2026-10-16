// userRoutes.js
const express = require('express');
const router = express.Router();
const userService = require('./services/user.service');
const authenticate = require('./middleware/authMiddleware');

router.post('/loginUser', userService.loginUser);
router.post('/register', userService.registerUser);
router.get('/getAllUsers', authenticate, userService.getAllUsers);
router.post('/getAllAvailableUsers', authenticate, userService.getAllAvailableUsers);
router.post('/getAllUserToExport',authenticate, userService.getAllUserToExport);
router.delete('/deleteUser/:id',authenticate, userService.deleteUser);
router.post('/editUser',authenticate, userService.editUser);
router.post('/sendMailToOwner',authenticate, userService.sendMailToOwner);
router.post('/bulkUploadUsers',authenticate, userService.bulkUploadUsers);


module.exports = router;
