const express = require('express');
const Keyword = require('../models/Keyword');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const keywords = await Keyword.find(filter).sort({ priority: 1, phrase: 1 }).lean();
    res.json(keywords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { phrase, category, priority } = req.body;
    if (!phrase || !category) {
      return res.status(400).json({ error: 'phrase and category are required' });
    }

    const keyword = await Keyword.create({
      phrase: phrase.toLowerCase().trim(),
      category,
      priority: priority || 2,
    });
    res.status(201).json(keyword);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Keyword already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const updates = {};
    const { phrase, category, isActive, priority } = req.body;
    if (phrase !== undefined) updates.phrase = phrase.toLowerCase().trim();
    if (category !== undefined) updates.category = category;
    if (isActive !== undefined) updates.isActive = isActive;
    if (priority !== undefined) updates.priority = priority;

    const keyword = await Keyword.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!keyword) return res.status(404).json({ error: 'Keyword not found' });
    res.json(keyword);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const keyword = await Keyword.findByIdAndDelete(req.params.id);
    if (!keyword) return res.status(404).json({ error: 'Keyword not found' });
    res.json({ message: 'Keyword deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
