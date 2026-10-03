const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getCategories
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/', getAllItems);
router.get('/:id', getItemById);
router.post('/', protect, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
