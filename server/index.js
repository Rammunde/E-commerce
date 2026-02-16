const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
require('./db/config');
const { updatePriceTypeScript } = require('./services/product.service');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Route handlers
app.use('/users', userRoutes);
app.use('/products', productRoutes);

// Initialize price type script
updatePriceTypeScript();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
