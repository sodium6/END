// routes/certificates.js
const express = require('express');
const router = express.Router();

const {
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getCertificateById,
  listMyCertificates,
  viewCertificateFile,         
} = require('../controllers/user/certificates/certificatesController');
const uploadCertificate = require('../middlewares/uploadCertificate');
const userAuth = require('../middlewares/userAuth');
// log ทุกคำขอที่เข้ามาถึง router นี้
router.use((req, _res, next) => {
  // console.log(`[certRoute] ${req.method} ${req.originalUrl}`);
  next();
});

router.get('/get',            userAuth, listMyCertificates);
router.get('/get/:id',        userAuth, getCertificateById);
router.get('/get/:id/file',   userAuth, viewCertificateFile); 

// ✅ create/update/delete
router.post('/create',        userAuth, uploadCertificate, createCertificate);
router.put('/update/:id',     userAuth, uploadCertificate, updateCertificate);
router.delete('/delete/:id',  userAuth, deleteCertificate);

module.exports = { path: 'certificates', route: router };
