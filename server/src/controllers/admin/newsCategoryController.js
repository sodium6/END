const NewsCategory = require('../../models/NewsCategory');

exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await NewsCategory.getAll();
        res.json({ categories });
    } catch (error) {
        next(error);
    }
};

exports.createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        const id = await NewsCategory.create(name, description);

        // Return the created object
        const newCategory = await NewsCategory.findById(id);
        res.status(201).json({ message: 'Category created', category: newCategory });
    } catch (error) {
        next(error);
    }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const affected = await NewsCategory.update(id, name, description);
        if (affected === 0) {
            return res.status(404).json({ message: 'Category not found or no changes made' });
        }
        const updated = await NewsCategory.findById(id);
        res.json({ message: 'Category updated', category: updated });
    } catch (error) {
        next(error);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const affected = await NewsCategory.delete(id);
        if (affected === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted' });
    } catch (error) {
        next(error);
    }
};
