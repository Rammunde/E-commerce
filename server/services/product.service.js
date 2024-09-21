const db = require("../db/dbConnection");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require("mongodb");
module.exports = {
  addProduct,
  getProductList,
  deleteProduct,
  editProduct
};

const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

async function addProduct(req, res) {
  const uploadMiddleware = upload.array('productImages');

  try {
    await new Promise((resolve, reject) => {
      uploadMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const { name, price, company, userId, productDescription } = req.body;
    const files = req.files || [];
    const base64Images = await Promise.all(files.map(file => {
      if (!file.buffer) {
        throw new Error("File buffer is missing");
      }
      return new Promise((resolve, reject) => {
        try {
          const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          resolve(base64String);
        } catch (error) {
          reject(error);
        }
      });
    }));

    const productDoc = {
      name: name,
      price: price,
      company: company,
      userId: userId,
      productDescription: productDescription,
      productImages: base64Images, // Base64-encoded images
      registrationDate: new Date(),
    };

    const collection = await db.connectProductsDb();
    await collection.insertOne(productDoc);

    res.json({ err: false, msg: "Product added successfully" });
  } catch (error) {
    console.error("Error while adding product:", error);
    res.status(500).json({ err: true, msg: "Failed to add product" });
  }
}

async function getProductList(req, res) {
  const collection = await db.connectProductsDb();
  const productList = await collection.find({}).toArray();
  if (productList) {
    res.status(200).json({ allProducts: productList });
  } else {
    res.status(500).json({ err: true, msg: "Internal server error" });
  }
}

async function deleteProduct(req, res) {
  const productId = req.params.id;

  try {
    const collection = await db.connectProductsDb();
    // const result = await collection.deleteOne({ _id: productId});
    const isExist = await collection.findOne({ _id: new ObjectId(productId) });
    if (isExist) {
      const result = await collection.deleteOne({
        _id: new ObjectId(productId),
      });
      res.status(200).json({ err: false, msg: "Product deleted successfully" });
    } else {
      res.status(200).json({ err: true, msg: "Product not exist" });
    }
  } catch (error) {
    console.error("Error while deleting product:", error);
    res.status(500).json({ err: true, msg: "Internal Server Error" });
  }
}

async function editProduct(req, res) {
  const { productId, name, company, price, userId } = req.body;

  const collection = await db.connectProductsDb();
  let result = await collection.updateOne(
    { _id: new ObjectId(productId) },
    { $set: { name, price, company, userId } }
  );
  if (result.modifiedCount > 0) {
    res.status(200).json({ err: false, msg: "Product Updated successfully" });
  }
  else {
    res.status(500).json({ err: true, msg: "Internal Server Error" });
  }
}
