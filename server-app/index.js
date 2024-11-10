import express from 'express';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { databaseQuery } from './mongoDBcall.js';

/**
 * Global constants and singletons
 */
const PORT = 8080;

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

/**
 * Global configuration
 */
const geminiTextToAllergen = await aiTextToJsonParser();

// Middleware to parse JSON in request body
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log('Request Body:', req.body);
  console.log('Request Query:', req.query);
  console.log('Request Params:', req.params);
  console.log('Request Headers:', req.headers);
  next();
});

// Route for processing text
app.post('/process/text', async (req, res) => {
  const unstructuredText = req.body.text ? req.body.text : '';
  const itemAllergenList = await processText(unstructuredText);
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

/**
 * Gemini AI
 */
async function aiTextToJsonParser() {
  try {
    const ai = await new GoogleGenerativeAI(process.env.API_KEY_GEMINI);
    const model = ai.getGenerativeModel(
      { model: 'gemini-1.5-flash-latest' },
      {
        generationConfig: { responseMimeType: 'application/json' },
      }
    );
    return async function (unstructuredText) {
      const prompt =
        'Act as a Food Scientist. Return a JSON list, formatted in lowercase. Return values as singular noun, not plural. Return the name of the ingredients. Input text:\n';

      const result = await model.generateContent(prompt + unstructuredText);
      return JSON.parse(
        result.response.text().replace('```json', '').replace('```', '')
      );
    };
  } catch (error) {
    console.error('Error initializing Gemini AI:', error);
    process.exit(1);
  }
}

async function mongoLookup(allergenList) {
  const allergenJSON = [];
  for (const item of allergenList) {
    const results = await databaseQuery(item);
    allergenJSON.push(results);
  }

  const flatAllergens = allergenJSON.flatMap((result) => {
    // Extract allergens from the nested object
    const allergens = Object.values(result[0] || {}).flat();
    return allergens || [];
  });

  const result = flatAllergens.map((item) => {
    // Get the second key in the object (i.e. nut, legume, egg, soy)
    const category = Object.keys(item)[1];
    return {
      name: category,
      ingredients: item[category],
    };
  });
  return result;
}

async function processText(unstructuredText) {
  const allergenList = await geminiTextToAllergen(unstructuredText);
  const itemAllergenList = await mongoLookup(allergenList);
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
