const db = require("../db/dbConnection");
const config = require("../db/config");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require("mongodb");
const { PRODUCTS, USERS_DB, ACTIVE_CART, ORDERS } = require('../common/collectionNames');
const { sendOrderConfirmation } = require('./email.service');

module.exports = {
  addProduct,
  updateProduct,
  getProductList,
  getProductById,
  deleteProduct,
  editProduct,
  addProductToCart,
  getAddedItems,
  removeAddedItems,
  IncreaseDecreaseItems,
  getAllProductList,
  updatePriceTypeScript,
  placeOrder,
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

/**
 * Validate and sanitize discount percentage
 * @param {*} value 
 * @returns {number} valid discount between 0 and 100
 */
function sanitizeDiscountPercentage(value) {
  if (value === undefined || value === null || value === "") return 0;
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) return 0;
  if (num > 100) return 100;
  return Number(num.toFixed(2));
}

async function addProduct(req, res) {
  const uploadMiddleware = upload.array('productImages');

  try {
    await new Promise((resolve, reject) => {
      uploadMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const { name, price, originalPrice, discountPercentage, company, userId, productDescription } = req.body;
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

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ err: true, msg: "Please enter a valid price." });
    }

    const validatedDiscount = sanitizeDiscountPercentage(discountPercentage);

    const productDoc = {
      name: name,
      price: parsedPrice,
      originalPrice: parsedPrice,
      discountPercentage: validatedDiscount,
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

async function updateProduct(req, res) {
  const uploadMiddleware = upload.array("productImages");

  try {
    // run multer
    await new Promise((resolve, reject) => {
      uploadMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const { id } = req.params;
    const {
      name,
      price,
      discountPercentage,
      company,
      productDescription,
      keepImageIndexes,
    } = req.body;

    const files = req.files || [];

    const collection = await db.connectProductsDb();

    // get existing product
    const product = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return res
        .status(404)
        .json({ err: true, msg: "Product not found" });
    }

    // filter existing images
    let finalImages = [];
    if (keepImageIndexes) {
      const indexes = JSON.parse(keepImageIndexes);
      finalImages = (product.productImages || []).filter(
        (_, index) => indexes.includes(index)
      );
    }

    // convert new images
    const newImages = files.map((file) =>
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
    );

    finalImages = [...finalImages, ...newImages];

    const parsedPrice = price !== undefined ? parseFloat(price) : undefined;
    const validatedDiscount = discountPercentage !== undefined ? sanitizeDiscountPercentage(discountPercentage) : undefined;

    // build update doc
    const updateDoc = {
      ...(name && { name }),
      ...(parsedPrice !== undefined && !isNaN(parsedPrice) && { price: parsedPrice, originalPrice: parsedPrice }),
      ...(validatedDiscount !== undefined && { discountPercentage: validatedDiscount }),
      ...(company && { company }),
      ...(productDescription && { productDescription }),
      ...(finalImages.length && { productImages: finalImages }),
      updatedAt: new Date(),
    };

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    res.json({
      err: false,
      msg: "Product updated successfully",
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      err: true,
      msg: "Failed to update product",
    });
  }
}

async function getProductList(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const collection = await db.connectProductsDb();

    const query = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const totalCount = await collection.countDocuments(query);
    const productList = await collection.find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Ensure numeric fields
    const formattedList = productList.map((p) => ({
      ...p,
      price: Number(p.price) || 0,
      originalPrice: Number(p.originalPrice || p.price) || 0,
      discountPercentage: Number(p.discountPercentage) || 0,
    }));

    res.status(200).json({
      allProducts: formattedList,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error("Error in getProductList:", error);
    res.status(500).json({ err: true, msg: "Internal server error" });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ err: true, msg: "Invalid product ID" });
    }
    const collection = await db.connectProductsDb();
    const product = await collection.findOne({ _id: new ObjectId(id) });
    if (!product) {
      return res.status(404).json({ err: true, msg: "Product not found" });
    }

    const formattedProduct = {
      ...product,
      price: Number(product.price) || 0,
      originalPrice: Number(product.originalPrice || product.price) || 0,
      discountPercentage: Number(product.discountPercentage) || 0,
    };

    res.status(200).json({ err: false, product: formattedProduct });
  } catch (error) {
    console.error("Error in getProductById:", error);
    res.status(500).json({ err: true, msg: "Internal server error" });
  }
}

async function deleteProduct(req, res) {
  const productId = req.params.id;

  try {
    const conn = await db.connectEcomerceDB();
    const active_cart_collection = conn.collection(config.ACTIVE_CART || ACTIVE_CART);
    const collection = await db.connectProductsDb();

    const isExist = await collection.findOne({ _id: new ObjectId(productId) });
    if (isExist) {
      await collection.deleteOne({
        _id: new ObjectId(productId),
      });
      await active_cart_collection.deleteMany({
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

async function editProduct(req, res) {
  const { productId, name, company, price, discountPercentage, userId } = req.body;

  try {
    const collection = await db.connectProductsDb();
    const convertedPrices = parseFloat(price);
    if (isNaN(convertedPrices) || convertedPrices < 0) {
      return res.status(400).json({ err: true, msg: "Invalid price" });
    }

    const validatedDiscount = sanitizeDiscountPercentage(discountPercentage);

    let result = await collection.updateOne(
      { _id: new ObjectId(productId) },
      {
        $set: {
          name,
          price: convertedPrices,
          originalPrice: convertedPrices,
          discountPercentage: validatedDiscount,
          company,
          userId,
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount > 0) {
      res.status(200).json({ err: false, msg: "Product Updated successfully" });
    } else {
      res.status(404).json({ err: true, msg: "Product not found" });
    }
  } catch (error) {
    console.error("Error in editProduct:", error);
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

    const { product_id, name, price, company, userId, productDescription, discountPercentage } = req.body;
    const conn = await db.connectEcomerceDB();
    const collection = conn.collection(config.ACTIVE_CART || ACTIVE_CART);
    const exist = await collection.findOne({ product_id, userId });
    if (exist) {
      return res.status(200).json({ error: false, msg: "Item already present in your cart" });
    }

    // Lookup latest product in DB to ensure fresh pricing data
    const productsColl = await db.connectProductsDb();
    let dbProduct = null;
    if (product_id && ObjectId.isValid(product_id)) {
      dbProduct = await productsColl.findOne({ _id: new ObjectId(product_id) });
    }

    const files = req.files || [];
    let base64Images = [];
    if (files.length > 0) {
      base64Images = await Promise.all(files.map(file => {
        if (!file.buffer) throw new Error("File buffer is missing");
        return Promise.resolve(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
      }));
    } else if (dbProduct?.productImages?.length) {
      base64Images = dbProduct.productImages;
    }

    const itemPrice = dbProduct ? Number(dbProduct.price) : parseFloat(price) || 0;
    const itemDiscount = dbProduct ? Number(dbProduct.discountPercentage) || 0 : sanitizeDiscountPercentage(discountPercentage);

    const productDoc = {
      product_id: product_id,
      name: dbProduct?.name || name,
      price: itemPrice,
      originalPrice: itemPrice,
      discountPercentage: itemDiscount,
      company: dbProduct?.company || company,
      userId: userId,
      productDescription: dbProduct?.productDescription || productDescription,
      productImages: base64Images,
      registrationDate: new Date(),
      quantity: 1
    };

    await collection.insertOne(productDoc);

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
    const collection = conn.collection(config.ACTIVE_CART || ACTIVE_CART);
    const productsColl = await db.connectProductsDb();

    const cartDocs = await collection.find({ userId }).toArray();

    if (cartDocs.length > 0) {
      // Sync fresh prices from products DB where available
      const enrichedItems = await Promise.all(
        cartDocs.map(async (item) => {
          let dbProduct = null;
          if (item.product_id && ObjectId.isValid(item.product_id)) {
            dbProduct = await productsColl.findOne({ _id: new ObjectId(item.product_id) });
          }

          const originalPrice = dbProduct ? Number(dbProduct.price) || 0 : Number(item.originalPrice || item.price) || 0;
          const discountPercentage = dbProduct
            ? Number(dbProduct.discountPercentage) || 0
            : Number(item.discountPercentage) || 0;

          const discountAmount = Number(((originalPrice * discountPercentage) / 100).toFixed(2));
          const sellingPrice = Number((originalPrice - discountAmount).toFixed(2));

          return {
            ...item,
            originalPrice,
            price: originalPrice,
            discountPercentage,
            discountAmount,
            sellingPrice,
            finalPrice: sellingPrice,
          };
        })
      );

      res.status(200).json({
        result: enrichedItems,
        total_items: enrichedItems.length,
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
    const collection = conn.collection(config.ACTIVE_CART || ACTIVE_CART);
    await collection.deleteOne({ product_id, userId });
    res.status(200).json({ msg: "Product removed successfully", err: false });
  } catch (error) {
    console.log("Error in removeAddedItems", error);
    res.status(500).json({ msg: "Error occurred while removing item", err: true });
  }
}

async function updatePriceTypeScript() {
  try {
    const conn = await db.connectEcomerceDB();
    const collection = conn.collection(config.ACTIVE_CART || ACTIVE_CART);

    const cursor = collection.find({ price: { $type: "string" } });

    for await (const doc of cursor) {
      const numericPrice = parseFloat(doc.price);
      if (!isNaN(numericPrice)) {
        await collection.updateOne(
          { _id: doc._id },
          { $set: { price: numericPrice, originalPrice: numericPrice } }
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
    const { product_id, userId, plus, minus } = req.body;
    const conn = await db.connectEcomerceDB();
    const collection = conn.collection(config.ACTIVE_CART || ACTIVE_CART);

    const incrementValue = plus ? 1 : minus ? -1 : 0;

    await collection.updateOne(
      { product_id, userId },
      { $inc: { quantity: incrementValue } }
    );

    const updateResult = await collection.findOne({ product_id, userId });
    if (updateResult && updateResult.quantity <= 0) {
      await collection.deleteOne({ product_id, userId });
    }
    res.status(200).json({ msg: "Successfully updated count", err: false });
  } catch (error) {
    console.error("Error in IncreaseDecreaseItems:", error);
    res.status(400).json({ msg: "Error in IncreaseDecreaseItems", err: true });
  }
}

async function getAllProductList(req, res) {
  try {
    const { searchString = "", sortBy = 'name', sortOrder = 'asc' } = req.body;
    const collection = await db.connectProductsDb();
    let andArray = [{}];

    if (searchString) {
      andArray.push({ name: { $regex: searchString, $options: "i" } });
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

    const formattedList = productList.map((p) => ({
      ...p,
      price: Number(p.price) || 0,
      originalPrice: Number(p.originalPrice || p.price) || 0,
      discountPercentage: Number(p.discountPercentage) || 0,
    }));

    res.json({
      productList: formattedList,
      totalCount: formattedList.length,
      msg: "Product List Retrieved Successfully",
    });
  } catch (error) {
    console.error("Error retrieving product list:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Place Order with Backend Price Calculation, Order Snapshot, and Email Confirmation
async function placeOrder(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ err: true, msg: "User ID is required" });
    }

    // Get cart items
    const conn = await db.connectEcomerceDB();
    const cartCollection = conn.collection(config.ACTIVE_CART || ACTIVE_CART);
    const cartItems = await cartCollection.find({ userId }).toArray();

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ err: true, msg: "Your cart is empty" });
    }

    // Get user details
    const usersCollection = conn.collection(config.USERS_DB || USERS_DB);
    let user = null;
    if (ObjectId.isValid(userId)) {
      user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    }

    if (!user || !user.email) {
      return res.status(400).json({ err: true, msg: "User not found or email not available" });
    }

    // Fetch live products from DB and compute server-side prices (never trust frontend prices)
    const productsCollection = await db.connectProductsDb();

    const orderItems = await Promise.all(
      cartItems.map(async (cartItem) => {
        let product = null;
        if (cartItem.product_id && ObjectId.isValid(cartItem.product_id)) {
          product = await productsCollection.findOne({ _id: new ObjectId(cartItem.product_id) });
        }

        // Base price from DB (fallback to stored cart price only if deleted)
        const originalPrice = product ? Number(product.price) || 0 : Number(cartItem.price) || 0;
        const discountPercentage = product
          ? sanitizeDiscountPercentage(product.discountPercentage)
          : sanitizeDiscountPercentage(cartItem.discountPercentage);

        // discountAmount = price * discountPercentage / 100
        const discountAmount = Number(((originalPrice * discountPercentage) / 100).toFixed(2));
        // sellingPrice = price - discountAmount
        const sellingPrice = Number((originalPrice - discountAmount).toFixed(2));
        const quantity = Number(cartItem.quantity) || 1;
        const totalPrice = Number((sellingPrice * quantity).toFixed(2));

        return {
          productId: product?._id ? product._id.toString() : cartItem.product_id,
          name: product?.name || cartItem.name,
          company: product?.company || cartItem.company || "",
          productImages: product?.productImages || cartItem.productImages || [],
          quantity,
          originalPrice,
          discountPercentage,
          discountAmount,
          sellingPrice,
          totalPrice,
        };
      })
    );

    // Calculate order summary
    const PLATFORM_FEE = 3;
    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const originalTotal = Number(
      orderItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0).toFixed(2)
    );
    const discountTotal = Number(
      orderItems.reduce((sum, item) => sum + item.discountAmount * item.quantity, 0).toFixed(2)
    );
    const finalTotal = Number((originalTotal - discountTotal + PLATFORM_FEE).toFixed(2));

    // Generate unique order ID
    const orderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Prepare order details for persistence
    const orderDoc = {
      orderId,
      userId,
      userName: user.fullName || user.firstName || "Customer",
      userEmail: user.email,
      orderItems,
      priceDetails: {
        totalItems,
        originalTotal: originalTotal.toFixed(2),
        discountTotal: discountTotal.toFixed(2),
        platformFee: PLATFORM_FEE,
        finalTotal: finalTotal.toFixed(2),
      },
      status: "Confirmed",
      orderDate: new Date(),
    };

    // Store the order snapshot in the database
    const ordersCollection = conn.collection(config.ORDERS || ORDERS);
    await ordersCollection.insertOne(orderDoc);

    // Send confirmation email
    try {
      await sendOrderConfirmation(user.email, {
        orderId,
        userName: orderDoc.userName,
        orderItems,
        priceDetails: orderDoc.priceDetails,
      });
    } catch (emailError) {
      console.warn("Failed to send order email:", emailError.message);
    }

    // Clear cart after successful order
    await cartCollection.deleteMany({ userId });

    res.status(200).json({
      err: false,
      msg: "Order placed successfully! Confirmation email sent.",
      orderId,
    });
  } catch (error) {
    console.error("Error in placeOrder:", error);
    res.status(500).json({
      err: true,
      msg: "Failed to place order. Please try again.",
    });
  }
}