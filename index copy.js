const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Multer setup: store file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// AWS SDK v3 client config
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload route
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = req.file;
  const fileName = `uploads/${Date.now()}_${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: 'public-read', // optional
  });

  try {
    await s3.send(command);
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    res.json({ uploadedTo: fileUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Simple route to check API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, API!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});










// const express = require('express');
// const AWS = require('aws-sdk');
// const multer = require('multer');
// const dotenv = require('dotenv');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // AWS SDK configuration
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION || 'us-east-1',
// });

// const s3 = new AWS.S3();

// // Multer setup (memory storage to avoid saving to disk)
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Simple test route
// app.get('/api/hello', (req, res) => {
//   res.json({ message: 'Hello, API!' });
// });

// // Echo route
// app.post('/api/echo', express.json(), (req, res) => {
//   res.json({ youSent: req.body });
// });

// // Upload endpoint — accepts a file field named "image"
// app.post('/api/upload', upload.single('image'), async (req, res) => {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }

//   const params = {
//     Bucket: process.env.S3_BUCKET_NAME,
//     Key: `uploads/${Date.now()}_${file.originalname}`,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//     ACL: 'public-read', // Make it public if you want direct access
//   };

//   try {
//     const data = await s3.upload(params).promise();
//     res.json({ uploadedTo: data.Location });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`API server running at http://localhost:${PORT}`);
// });









// // const express = require('express');
// // const AWS = require('aws-sdk');
// // const fs = require('fs');
// // const path = require('path');
// // require('dotenv').config();

// // const app = express();
// // app.use(express.json());
// // const PORT = process.env.PORT || 5000;

// // // AWS SDK configuration
// // AWS.config.update({
// //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
// //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// //     region: 'us-east-1' // change to your region
// // });

// // const s3 = new AWS.S3();

// // function uploadImage(filePath, fileName) {
// //     const fileContent = fs.readFileSync(filePath);

// //     const params = {
// //         Bucket: 'my-app-images',
// //         Key: fileName,
// //         Body: fileContent,
// //         ACL: 'public-read', // or private, depending on your use case
// //         ContentType: 'image/jpeg' // or detect MIME type dynamically
// //     };

// //     return s3.upload(params).promise();
// // }

// // // Example GET endpoint
// // app.get('/api/hello', (req, res) => {
// //     res.json({ message: 'Hello, API!' });
// // });

// // // Example POST endpoint
// // app.post('/api/echo', (req, res) => {
// //     res.json({ youSent: req.body });
// // });

// // // Example endpoint to upload an image (for demonstration)
// // app.post('/api/upload', async (req, res) => {
// //     // For demo: expects { filePath, fileName } in body
// //     const { filePath, fileName } = req.body;
// //     try {
// //         const data = await uploadImage(filePath, fileName);
// //         res.json({ uploadedTo: data.Location });
// //     } catch (err) {
// //         res.status(500).json({ error: err.message });
// //     }
// // });

// // app.listen(PORT, () => {
// //     console.log(`API server running at http://localhost:${PORT}`);
// // });