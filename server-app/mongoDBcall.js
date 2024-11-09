import { MongoClient, ServerApiVersion } from 'mongodb';
import 'dotenv/config';

const MONGODB_URI = process.env.URI_MONGODB;
if (!MONGODB_URI) {
  throw new Error(
    'MongoDB connection string is undefined. Check your .env file.'
  );
}

async function findIngredient(db, ingredient) {
  const ingredientStr = String(ingredient); // Ensure ingredient is a string

  const ingredientIn = await db
    .collection('FoodRestrictions')
    .find({
      $or: [
        { nutsAllergy: { $regex: ingredientStr, $options: 'i' } },
        //{ "muslim": { "$regex": ingredientStr, "$options": "i" } },
        //{ "jainism": { "$regex": ingredientStr, "$options": "i" } },
        //{ "hindi": { "$regex": ingredientStr, "$options": "i" } },
        //{ "sihk": { "$regex": ingredientStr, "$options": "i" } },
        //{ "jewish": { "$regex": ingredientStr, "$options": "i" } },
        { egg: { $regex: ingredientStr, $options: 'i' } },
        { legume: { $regex: ingredientStr, $options: 'i' } },
        { shell_fish: { $regex: ingredientStr, $options: 'i' } },
        { nut: { $regex: ingredientStr, $options: 'i' } },
        { dairy: { $regex: ingredientStr, $options: 'i' } },
        { gluten: { $regex: ingredientStr, $options: 'i' } },
        { fish: { $regex: ingredientStr, $options: 'i' } },
        { soybean: { $regex: ingredientStr, $options: 'i' } },
        { sesame: { $regex: ingredientStr, $options: 'i' } },
        { peanut: { $regex: ingredientStr, $options: 'i' } },
        { lupin: { $regex: ingredientStr, $options: 'i' } },
        { mustard: { $regex: ingredientStr, $options: 'i' } },
        { sulfa: { $regex: ingredientStr, $options: 'i' } },
      ],
    })
    .toArray();

  return ingredientIn;
}

// Call the MongoDB looking for an ingredient, if found, return JSON of items
async function findAllIngredients(db, ingredients) {
  const presentIngredients = [];
  const result = await findIngredient(db, ingredients);
  presentIngredients.push(result);
  if (presentIngredients[0].length > 0) {
    return presentIngredients;
  } else return;
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

export async function databaseQuery(ingredient) {
  // Connect the client to the server (optional starting in v4.7)
  await client.connect();
  const db = await client.db('HTF-2024');
  const result = await findAllIngredients(db, ingredient);
  if (result != undefined) {
    return result;
  }
  // Ensures that the client will close when you finish/error
  else {
    return;
  }
}
