import connectDB from '../config/db.js';
import DndItem from '../models/ingredient.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to convert image to base64
function imageToBase64(imagePath) {
  try {
    const fullPath = path.join(__dirname, '..', '..', '..', 'frontend', 'src', 'assets', 'drag&drop', imagePath);
    const imageBuffer = fs.readFileSync(fullPath);
    const base64String = imageBuffer.toString('base64');
    const mimeType = 'image/png'; // Assuming all images are PNG
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error(`Error reading image ${imagePath}:`, error.message);
    return null;
  }
}

async function seedDndItems() {
  await connectDB();

  // Clear existing dnd items
  await DndItem.deleteMany({});
  console.log('Cleared existing dnd items');

  // Total price for a drink is 100 PHP, distributed among 6 items
  const basePrice = 100 / 6; // ~16.67 PHP per item

  const dndItems = [
    {
      ingredientName: 'Bamboo Charcoal Powder',
      price: Math.round(basePrice * 1.2), // 20 PHP - premium item
      image: 'Bamboo Charcoal Powder.png'
    },
    {
      ingredientName: 'Caramel Powder',
      price: Math.round(basePrice * 1.1), // 18 PHP - popular item
      image: 'Caramel Powder.png'
    },
    {
      ingredientName: 'Cookies & Cream Powder',
      price: Math.round(basePrice * 1.1), // 18 PHP - popular item
      image: 'Cookies & Cream Powder.png'
    },
    {
      ingredientName: 'Milk',
      price: Math.round(basePrice * 0.9), // 15 PHP - basic item
      image: 'Milk.png'
    },
    {
      ingredientName: 'Strawberry Jam',
      price: Math.round(basePrice * 1.0), // 17 PHP - standard item
      image: 'Strawberry Jam.png'
    },
    {
      ingredientName: 'Ice',
      price: Math.round(basePrice * 0.7), // 12 PHP - basic item
      image: 'Ice.png'
    }
  ];

  for (const itemData of dndItems) {
    const base64Image = imageToBase64(itemData.image);

    if (base64Image) {
      const dndItem = new DndItem({
        ingredientName: itemData.ingredientName,
        price: itemData.price,
        image: base64Image,
        isActive: true
      });

      await dndItem.save();
      console.log(`Created dnd item: ${itemData.ingredientName} - ₱${itemData.price}`);
    } else {
      console.error(`Failed to create dnd item: ${itemData.ingredientName} - image not found`);
    }
  }

  console.log('Dnd items seeding completed!');
  process.exit(0);
}

seedDndItems().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
