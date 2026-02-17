// src/routes/dashboardRoute.js
const express = require('express');
const  requireAuth  = require('../middlewares/userAuth');


const { getDashboardSummary } = require('../controllers/user/dashboard/dashboardController');
const { listWorks }          = require('../controllers/user/dashboard/worksController');
const { listActivities }     = require('../controllers/user/dashboard/activitiesController');
const { listSports }         = require('../controllers/user/dashboard/sportsController');
const { listCertificates }   = require('../controllers/user/dashboard/certificatesController');
const { listNews }           = require('../controllers/user/dashboard/newsController');

const router = express.Router();

function assertFn(fn, name) {
  if (typeof fn !== 'function') {
    throw new TypeError(`Handler "${name}" must be a function, got ${typeof fn}. Check your exports/imports & paths.`);
  }
  return fn;
}

// ---------- Public ----------
router.get('/news', assertFn(listNews, 'listNews'));

// ---------- Protected ----------
router.get('/dashboard',    assertFn(requireAuth, 'requireAuth'),  assertFn(getDashboardSummary, 'getDashboardSummary'));
router.get('/works',        assertFn(requireAuth, 'requireAuth'),  assertFn(listWorks, 'listWorks'));
router.get('/activities',   assertFn(requireAuth, 'requireAuth'),  assertFn(listActivities, 'listActivities'));
router.get('/sports',       assertFn(requireAuth, 'requireAuth'),  assertFn(listSports, 'listSports'));
router.get('/certificates', assertFn(requireAuth, 'requireAuth'),  assertFn(listCertificates, 'listCertificates'));

module.exports = { path: 'dashboard', route: router };
