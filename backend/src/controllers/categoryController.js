const ServiceCategory = require('../models/ServiceCategory');

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new category (Admin only)
// @route   POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, subcategories } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const category = await ServiceCategory.create({
      name,
      slug,
      description,
      icon: icon || 'Wrench',
      subcategories: subcategories || []
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category (Admin only)
// @route   PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    Object.assign(category, req.body);
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.isActive = false;
    await category.save();
    res.json({ message: 'Category deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
