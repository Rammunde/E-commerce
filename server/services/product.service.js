const db = require("../db/dbConnection");
const config = require("../db/config");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require("mongodb");
const {PRODUCTS, USERS_DB} = require('../common/collectionNames');
module.exports = {
  addProduct,
  getProductList,
  deleteProduct,
  editProduct,
  addProductToCart,
  getAddedItems,
  removeAddedItems,
  IncreaseDecreaseItems,
  getAllProductList,
  updatePriceTypeScript,
  deleteProduct
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

    const { name, price, originalPrice, company, userId, productDescription } = req.body;
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
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice),
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
  const convertedPrices = parseFloat(price);
  let result = await collection.updateOne(
    { _id: new ObjectId(productId) },
    { $set: { name, price: convertedPrices, originalPrice: convertedPrices, company, userId } }
  );
  if (result.modifiedCount > 0) {
    res.status(200).json({ err: false, msg: "Product Updated successfully" });
  }
  else {
    res.status(500).json({ err: true, msg: "Internal Server Error" });
  }
}

async function addProductToCart(req, res) {
  const uploadMiddleware = upload.array('productImages');

  try {
    await new Promise((resolve, reject) => {
      uploadMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const { product_id, name, price, company, userId, productDescription, originalPrice } = req.body;
    const conn = await db.connectEcomerceDB();
    const collection = conn.collection(config.ACTIVE_CART);
    const exist = await collection.findOne({ product_id, userId });
    if (exist) {
      return res.status(200).json({ error: false, msg: "Item already present in your cart" });
    }


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
      product_id: product_id,
      name: name,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice),
      company: company,
      userId: userId,
      productDescription: productDescription,
      productImages: base64Images, // Base64-encoded images
      registrationDate: new Date(),
      quantity: 1
    };

    let result = await collection.insertOne(productDoc);

    res.status(200).json({ error: false, msg: "Item successfully added to your cart" });
  } catch (error) {
    console.error("error in addProductToCart ", error);
    res.status(500).json({ error: true, msg: "Something went wrong" });
  }
}

async function getAddedItems(req, res) {
  try {
    const userId = req.params.userId;

    const conn = await db.connectEcomerceDB();
    const collection = conn.collection(config.ACTIVE_CART);

    const pipeline = [
      {
        $match: { userId: userId },
      },
      // {
      //   $group: {
      //     _id: "$name",
      //     productDetails: { $first: "$$ROOT" },
      //     quantity: { $sum: 1 },
      //   },
      // },
      // {
      //   $project: {
      //     _id: 0,
      //     name: "$_id", // Use `_id` (grouped name) as `name`
      //     product_id: "$productDetails.product_id",
      //     price: "$productDetails.price",
      //     company: "$productDetails.company",
      //     userId: "$productDetails.userId",
      //     productDescription: "$productDetails.productDescription",
      //     productImages: { $slice: ["$productDetails.productImages", 1] },
      //     quantity: 1,
      //   },
      // },
    ];

    const result = await collection.aggregate(pipeline).toArray();

    if (result.length > 0) {
      res.status(200).json({
        result: result,
        total_items: result.length,
        msg: "",
        error: false,
      });
    } else {
      res.status(200).json({
        result: [],
        total_items: 0,
        msg: "Your cart is empty !...",
        error: false,
      });
    }
  } catch (error) {
    console.error("Error in getAddedItems", error);
    res.status(500).json({
      result: [],
      total_items: 0,
      msg: "Error while fetching records!",
      error: true,
    });
  }
}

async function removeAddedItems(req, res) {
  try {
    const { product_id, userId } = req.body;
    const conn = await db.connectEcomerceDB();
    const collection = conn.collection(config.ACTIVE_CART);
    const result = await collection.deleteOne(
      {
        product_id: product_id
      },
      {
        userId: userId
      }
    )
    res.status(200).json({ msg: "Product removed successfully", err: false });
  } catch (error) {
    console.log("Error in removeAddedItems");
    res.status(500).json({ msg: "Error occured while removing item", err: true });
  }
}

async function updatePriceTypeScript() {
  try {
    const conn = await db.connectEcomerceDB();
    const collection = conn.collection(config.ACTIVE_CART);

    const cursor = collection.find({ price: { $type: "string" } });

    for await (const doc of cursor) {
      const numericPrice = parseFloat(doc.price);
      if (!isNaN(numericPrice)) {
        await collection.updateOne(
          { _id: doc._id },
          { $set: { price: numericPrice } }
        );
      }
    }

    console.log("Price field updated to numeric where necessary.");
  } catch (error) {
    console.error("Error updating price type:", error);
  }
}

async function IncreaseDecreaseItems(req, res) {
  try {

    const { product_id, userId, plus, minus, originalPrice } = req.body;
    const conn = await db.connectEcomerceDB();
    const collection = conn.collection(config.ACTIVE_CART);

    const incrementValue = plus ? 1 : minus ? -1 : 0;

    const convertPriceType = parseFloat(originalPrice);
    const updatePrice = plus ? convertPriceType : minus ? -convertPriceType : 0
    await collection.updateOne(
      { product_id, userId },
      { $inc: { quantity: incrementValue, price: updatePrice } });

    let updateResult = await collection.findOne({ product_id, userId });
    if (updateResult && updateResult.quantity <= 0) {
      await collection.deleteOne({ product_id, userId });
    }
    res.status(200).json({ msg: "Succesfully update count", err: false });
  } catch (error) {
    res.status(400).json({ msg: "error in increaseDecreaseItems", err: true });
  }
}

async function getAllProductList(req, res) {
  try {
    const { searchString = "", sortBy = 'name', sortOrder = 'asc', limit = 10, offset = 0 } = req.body;
    const collection = await db.connectProductsDb();
    let andArray = [{}];

    if (searchString) {
      andArray.push({ name: { $regex: searchString, $options: "i" } })
    }

    const pipeline = [];

    // Apply filters first
    if (andArray.length > 0) {
      pipeline.push({
        $match: { $and: andArray }
      });
    }

    // Convert string userId to ObjectId
    pipeline.push({
      $addFields: {
        userIdObj: {
          $convert: {
            input: "$userId",
            to: "objectId",
            onError: null,
            onNull: null
          }
        }
      }
    });

    // Join with users collection
    pipeline.push(
      {
        $lookup: {
          from: USERS_DB,
          localField: "userIdObj",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          product_name: "$user.fullName"
        }
      },
      {
        $project: {
          user: 0,
          userIdObj: 0
        }
      }
    );


    pipeline.push({ $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } });

    const productList = await collection.aggregate(pipeline).toArray();

    let totalCount = 0;
    if (productList.length > 0) {
      totalCount = productList.length;
    }

    res.json({
      productList: productList,
      totalCount: totalCount,
      msg: "Product List Retrieved Successfully",
    });
  } catch (error) {
    console.error("Error retrieving product list:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


async function deleteProduct(req, res) {
  const productId = req.params.id;
  console.log("productId", productId);

  try {
        const conn = await db.connectEcomerceDB();
    const active_cart_collection = conn.collection(config.ACTIVE_CART);
   const collection = await db.connectProductsDb();
    // const result = await collection.deleteOne({ _id: userId});
    const isExist = await collection.findOne({ _id: new ObjectId(productId) });
    if (isExist) {
      await collection.deleteOne({
        _id: new ObjectId(productId),
      });
       await active_cart_collection.deleteOne({
        product_id: productId,
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