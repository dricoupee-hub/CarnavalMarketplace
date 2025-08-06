const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Users routes working' });
});

module.exports = router;