const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Payments routes working' });
});

module.exports = router;