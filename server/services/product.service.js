const db = require("../db/dbConnection");
const { ObjectId } = require("mongodb");
module.exports = {
  addProduct,
  getProductList,
  deleteProduct,
  editProduct
};

async function addProduct(req, res) {
  const { name, price, company, userId, productDescription } = req.body;

  let _doc = {
    name: name,
    price: price,
    company: company,
    userId: userId,
    productDescription: productDescription,
    registrationDate: new Date(),
  };

  try {
    const collection = await db.connectProductsDb();
    await collection.insertOne(_doc);

    res.json({ err: false, msg: "Product added Successfully" });
  } catch (error) {
    res.json({ err: true, msg: "Failed to add product" });
    console.error("Error while adding product:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
  if(result.modifiedCount > 0){
    res.status(200).json({ err: false, msg: "Product Updated successfully" });
  }
  else{
    res.status(500).json({ err: true, msg: "Internal Server Error" });    
  }
}
