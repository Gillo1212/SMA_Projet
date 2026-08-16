const router = require('express').Router();
const path = require('path');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * POST /api/upload/image
 * Upload une image (admin uniquement) et retourne l'URL publique.
 */
router.post('/image', authenticate, requireAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? `Fichier trop volumineux (max ${Math.round(parseInt(process.env.MAX_FILE_SIZE || '10485760') / 1024 / 1024)} MB)`
        : err.message;
      return res.status(400).json({ success: false, message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      success: true,
      message: 'Image uploadée avec succès',
      url: fileUrl,
      filename: req.file.filename,
    });
  });
});

module.exports = router;
