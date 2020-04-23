import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const uploadPath = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: uploadPath,
  storage: multer.diskStorage({
    destination: uploadPath,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
