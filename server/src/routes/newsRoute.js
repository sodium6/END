// routes/news.routes.js
const express = require('express');
const ctrl = require('../controllers/user/news/newsController');

const router = express.Router();

router.get('/', ctrl.listNews);      // GET /api/news
router.get('/:id', ctrl.getNews);    // GET /api/news/:id
router.post("/subscribe", ctrl.subscribe);
router.post("/unsubscribe", ctrl.unsubscribe);

module.exports = {
    path: "news",
    route: router,
  };
  