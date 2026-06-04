const multer = require('multer');
const path = require('path');

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png|xls|xlsx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /pdf|jpeg|png|excel|spreadsheet|octet-stream/.test(file.mimetype);

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, PNG, and Excel files are allowed'));
  }
};

// Always use memoryStorage — works on both local and Vercel serverless
// (Vercel buffers request bodies before the function runs, breaking stream-based disk storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
  },
  fileFilter: fileFilter
});

module.exports = upload;
