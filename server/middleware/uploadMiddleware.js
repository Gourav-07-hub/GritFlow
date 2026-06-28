import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only jpg, jpeg, png and webp images are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

const saveLocally = (req, next) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'avatars');
  fs.mkdirSync(uploadsDir, { recursive: true });
  const ext = path.extname(req.file.originalname) || '.png';
  const filename = `${req.user?._id || Date.now()}-${Date.now()}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, req.file.buffer);
  req.cloudinaryResult = {
    secure_url: `/uploads/avatars/${filename}`,
  };
  next();
};

export const uploadAvatar = (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer upload error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image size must be under 10MB' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      console.error('Upload middleware error:', err);
      if (err.message === 'Only jpg, jpeg, png and webp images are allowed') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return next();
    }

    // Try Cloudinary, fall back to local on any failure
    const b64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    cloudinary.uploader.upload(b64, {
      folder: 'life_dashboard/avatars',
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    })
      .then((result) => {
        req.cloudinaryResult = result;
        next();
      })
      .catch((uploadErr) => {
        console.warn('Cloudinary upload failed, saving locally:', uploadErr.message);
        saveLocally(req, next);
      });
  });
};
