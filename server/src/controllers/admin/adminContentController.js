const News = require('../../models/News');

// Get all news articles (paginated)
exports.getAllNews = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, q = '' } = req.query;
    const result = await News.getAll({ page: parseInt(page), pageSize: parseInt(pageSize), q });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get a single news article by ID
exports.getNewsById = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    res.json({ news });
  } catch (error) {
    next(error);
  }
};

// Create a new news article
exports.createNews = async (req, res, next) => {
  try {
    // The admin_id should come from the authenticated user
    const admin_id = req.admin.id || req.admin.admin_id;
    const newsData = { ...req.body, admin_id };
    
    const newsId = await News.create(newsData);
    res.status(201).json({ message: 'News article created', newsId });
  } catch (error) {
    next(error);
  }
};

// Update a news article
exports.updateNews = async (req, res, next) => {
  try {
    const affectedRows = await News.update(req.params.id, req.body);
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'News article not found' });
    }
    res.json({ message: 'News article updated' });
  } catch (error) {
    next(error);
  }
};

// Delete a news article
exports.deleteNews = async (req, res, next) => {
  try {
    const affectedRows = await News.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'News article not found' });
    }
    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
};