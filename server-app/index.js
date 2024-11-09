const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = 8080;

// Multer storage configuration for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Middleware to parse JSON in request body
app.use(express.json());
app.use((req, res, next) => {
  console.log('Request Body:', req.body);
  console.log('Request Query:', req.query);
  console.log('Request Params:', req.params);
  console.log('Request Headers:', req.headers);
  next();
});

// Route for processing text
app.post('/process/text', (req, res) => {
  const unstructuredText = req.body.text ? req.body.text : '';
  const itemAllergenList = itemAllergenList;
  res.json(itemAllergenList);
});

// Route for processing images
app.post('/process/image', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;

  // Process the image (e.g., image recognition, object detection, etc.)
  const processedImage = processImage(imagePath);

  // Delete the uploaded image after processing
  fs.unlinkSync(imagePath);

  res.json({ processedImage });
});

// Route for processing URLs
app.post('/process/url', (req, res) => {
  const url = req.body.url;

  // Fetch the content from the URL
  axios
    .get(url)
    .then((response) => {
      const content = response.data;

      // Process the content (e.g., extract information, scrape data, etc.)
      const processedContent = processUrlContent(content);

      res.json({ processedContent });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to fetch URL content' });
    });
});

function geminiTextToAllergen(unstructuredText) {
  return unstructuredText;
}

function mongoLookup(allergenList) {
  return allergenList;
}

function processText(unstructuredText) {
  const allergenList = geminiTextToAllergen(unstructuredText);
  const itemAllergenList = mongoLookup(allergenList);
  return itemAllergenList;
}

function processImage(imagePath) {
  // Implement your image processing logic here
  return `Processed image: ${imagePath}`;
}

function processUrlContent(content) {
  // Implement your URL content processing logic here
  return `Processed content: ${content}`;
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
