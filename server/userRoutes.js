// userRoutes.js
const express = require('express');
const router = express.Router();
const userService = require('./services/user.service');

router.post('/loginUser', userService.loginUser);
router.post('/register', userService.registerUser);
router.get('/getAllUsers', userService.getAllUsers);
router.delete('/deleteUser/:id', userService.deleteUser);
router.post('/editUser', userService.editUser);


module.exports = router;
