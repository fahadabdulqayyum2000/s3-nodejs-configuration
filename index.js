const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Multer setup: store files in memory
// const storage = multer.memoryStorage();
// const upload = multer.fields([
//   { name: 'image', maxCount: 1 },
//   { name: 'cv', maxCount: 1 }
// ]);

const storage = multer.memoryStorage();
const upload = multer({ storage }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'cv', maxCount: 1 }
]);

// AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload route supporting both image and CV
app.post('/api/upload', upload, async (req, res) => {
  const uploadedFiles = [];

  try {
    if (req.files.image) {
      const imageFile = req.files.image[0];
      const imageKey = `uploads/images/${Date.now()}_${imageFile.originalname}`;
      const imageUpload = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: imageKey,
        Body: imageFile.buffer,
        ContentType: imageFile.mimetype,
      });
      await s3.send(imageUpload);
      uploadedFiles.push({
        type: 'image',
        url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`,
      });
    }

    if (req.files.cv) {
      const cvFile = req.files.cv[0];
      const cvKey = `uploads/cv/${Date.now()}_${cvFile.originalname}`;
      const cvUpload = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: cvKey,
        Body: cvFile.buffer,
        ContentType: cvFile.mimetype,
      });
      await s3.send(cvUpload);
      uploadedFiles.push({
        type: 'cv',
        url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${cvKey}`,
      });
    }

    if (uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No valid file uploaded' });
    }

    res.json({ uploaded: uploadedFiles });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Basic test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, API!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
