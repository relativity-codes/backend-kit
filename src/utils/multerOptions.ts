import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads', // Specify upload directory
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, callback) => {
    // Extend the allowed file types
    const allowedMimeTypes =
      /\/(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|mp4|avi)$/;

    if (!file.mimetype.match(allowedMimeTypes)) {
      return callback(
        new Error('Only specific file types are allowed!'),
        false,
      );
    }
    callback(null, true);
  },
};
