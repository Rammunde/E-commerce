const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
require('./db/config');
const { updatePriceTypeScript } = require('./services/product.service');

const config = require('./config');

const app = express();

// Middleware
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS,QUERY"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return res.sendStatus(204);
  }

  next();
});
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Route handlers
app.use('/users', userRoutes);
app.use('/products', productRoutes);

// Initialize price type script
updatePriceTypeScript();

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
