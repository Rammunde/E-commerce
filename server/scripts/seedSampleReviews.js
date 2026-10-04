#!/usr/bin/env node

/**
 * Script: seedSampleReviews.js
 * Populates realistic customer reviews for existing catalog products in MongoDB
 * and generates the initial AI Review Analysis cache.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const db = require('../db/dbConnection');
const { computeAndSaveAnalysis } = require('../services/review.service');

const sampleReviewsCatalog = [
  {
    categoryMatch: ['phone', 'iphone', 'mobile'],
    reviews: [
      {
        userName: 'Alex Johnson',
        rating: 5,
        title: 'Outstanding camera and battery life!',
        comment: 'The camera quality is breathtaking, especially for portrait shots. Battery easily lasts 1.5 days on heavy usage.',
        verifiedPurchase: true,
      },
      {
        userName: 'Samantha Lee',
        rating: 4,
        title: 'Great device, slightly slow charging',
        comment: 'Smooth 120Hz display and fantastic build quality. However, charging feels somewhat slow compared to competitors.',
        verifiedPurchase: true,
      },
      {
        userName: 'Michael Brown',
        rating: 4,
        title: 'Impressive performance',
        comment: 'Multitasking and gaming are buttery smooth. Premium feel in hand. The speakers are clear and loud.',
        verifiedPurchase: true,
      },
      {
        userName: 'David K.',
        rating: 3,
        title: 'Good phone but low-light camera needs improvement',
        comment: 'Daytime photos look incredible, but low-light noise is noticeable. Also the phone gets slightly warm during extended gaming.',
        verifiedPurchase: false,
      },
      {
        userName: 'Elena Rostova',
        rating: 5,
        title: 'Best smartphone purchase this year',
        comment: 'Sleek aesthetics, sharp screen, and long-lasting battery. Very satisfied with the overall user experience.',
        verifiedPurchase: true,
      },
    ],
  },
  {
    categoryMatch: ['laptop', 'computer', 'macbook'],
    reviews: [
      {
        userName: 'Daniel Wright',
        rating: 5,
        title: 'Blazing fast speed and sleek keyboard',
        comment: 'Handles heavy coding, video editing, and dozens of browser tabs without breaking a sweat. Keyboard feel is top notch.',
        verifiedPurchase: true,
      },
      {
        userName: 'Priya Patel',
        rating: 4,
        title: 'Excellent portable workstation',
        comment: 'Lightweight and has an amazing crisp screen. Battery lasts through an entire workday. Fan gets audible under intense load.',
        verifiedPurchase: true,
      },
      {
        userName: 'Lucas Gomez',
        rating: 3,
        title: 'Decent performance, limited port selection',
        comment: 'Performance is solid, but you will definitely need a USB-C dongle for legacy devices. Speakers are decent.',
        verifiedPurchase: true,
      },
      {
        userName: 'Chloe Bennett',
        rating: 5,
        title: 'Reliable and durable build',
        comment: 'Trackpad precision is best in class. Fast boot times and vibrant display colors. Worth every dollar.',
        verifiedPurchase: true,
      },
    ],
  },
  {
    categoryMatch: ['sneaker', 'shoe', 'shoes', 'footwear', 'boldstep'],
    reviews: [
      {
        userName: 'Jordan Miller',
        rating: 5,
        title: 'Incredible comfort for running and walking',
        comment: 'Super cushioned soles with great arch support. Ran a 10k right out of the box with zero blisters. Highly recommended!',
        verifiedPurchase: true,
      },
      {
        userName: 'Rachel Green',
        rating: 4,
        title: 'Stylish and comfortable, runs slightly small',
        comment: 'Looks great with jeans or athletic wear. Be sure to order a half-size up because the toe box is a bit narrow.',
        verifiedPurchase: true,
      },
      {
        userName: 'Carlos Santana',
        rating: 5,
        title: 'Breathable and lightweight',
        comment: 'Keeps feet cool during hot summer days. Very durable tread that grips well on pavement and trails.',
        verifiedPurchase: false,
      },
      {
        userName: 'Emma Watson',
        rating: 3,
        title: 'Good everyday sneaker',
        comment: 'Decent padding for casual walks, but ankle support could be stiffer for high-intensity training.',
        verifiedPurchase: true,
      },
    ],
  },
  {
    categoryMatch: ['watch', 'smartwatch', 'wearable'],
    reviews: [
      {
        userName: 'Nathan Drake',
        rating: 5,
        title: 'Accurate fitness tracking & sharp display',
        comment: 'Heart rate and sleep tracking are spot-on. The AMOLED display is bright enough to read even under direct midday sunlight.',
        verifiedPurchase: true,
      },
      {
        userName: 'Hannah Montana',
        rating: 4,
        title: 'Great daily companion',
        comment: 'Notification syncing is instantaneous. Comfortable strap for all-day wear. Needs charging every two days.',
        verifiedPurchase: true,
      },
      {
        userName: 'Trevor Philips',
        rating: 3,
        title: 'Good features, proprietary charger is annoying',
        comment: 'Software is intuitive and responsive. I wish it supported wireless Qi charging instead of the included proprietary dock.',
        verifiedPurchase: true,
      },
    ],
  },
];

async function seed() {
  console.log('===========================================================');
  console.log(' Seeding Realistic Sample Customer Reviews');
  console.log('===========================================================');

  const productsColl = await db.connectProductsDb();
  const reviewsColl = await db.connectReviewsDb();
  const analysisColl = await db.connectReviewAnalysisDb();

  const products = await productsColl.find({}).toArray();
  console.log(`Found ${products.length} products in database.\n`);

  let totalAdded = 0;

  for (const product of products) {
    const pName = (product.name || '').toLowerCase();
    const pCategory = (product.category || '').toLowerCase();
    const pText = `${pName} ${pCategory} ${product.company || ''}`;

    // Find matching template or default to first
    let matchedTemplate = sampleReviewsCatalog.find(template =>
      template.categoryMatch.some(cat => pText.includes(cat))
    );

    if (!matchedTemplate) {
      matchedTemplate = sampleReviewsCatalog[0]; // fallback
    }

    // Check existing reviews
    const existingCount = await reviewsColl.countDocuments({ productId: product._id });
    if (existingCount > 0) {
      console.log(`Product "${product.name}" already has ${existingCount} reviews. Generating/updating analysis...`);
      await computeAndSaveAnalysis(product._id.toString(), reviewsColl, analysisColl, productsColl);
      continue;
    }

    // Insert sample reviews
    const reviewsToInsert = matchedTemplate.reviews.map(r => ({
      ...r,
      productId: product._id,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // within last 30 days
      updatedAt: new Date(),
    }));

    await reviewsColl.insertMany(reviewsToInsert);
    totalAdded += reviewsToInsert.length;
    console.log(`✓ Inserted ${reviewsToInsert.length} reviews for "${product.name}"`);

    // Compute initial AI Review Analysis
    await computeAndSaveAnalysis(product._id.toString(), reviewsColl, analysisColl, productsColl);
    console.log(`  -> Generated AI Review Analysis for "${product.name}"`);
  }

  console.log('\n===========================================================');
  console.log(`Successfully seeded ${totalAdded} reviews across ${products.length} products.`);
  console.log('===========================================================');

  await db.closeEcomerceDB();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error('Seeding error:', err);
  try { await db.closeEcomerceDB(); } catch {}
  process.exit(1);
});
