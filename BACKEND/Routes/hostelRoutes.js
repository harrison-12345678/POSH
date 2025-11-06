const express = require('express');
const { getHostels } = require('../Controllers/hostelController');

const router = express.Router();

router.get('/', getHostels);

module.exports = router;
