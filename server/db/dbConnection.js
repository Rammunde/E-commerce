const config = require("./config");
const { MongoClient } = require("mongodb");

const client = new MongoClient(config.URL);

async function connectEcomerceDB() {
  try {
    await client.connect();
    console.log("Connected to the database successfully");
    return client.db(config.ECOMMERCE);
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}
async function connectUsersDB() {
  try {
    const db = await connectEcomerceDB();
    const collection = db.collection(config.USERS_DB);
    console.log("Connected to the users collection successfully");
    return collection;
  } catch (error) {
    console.error("Error connecting to the users collection:", error);
    throw error;
  }
}

async function connectProductsDb() {
  try {
    const db = await connectEcomerceDB();
    const collection = db.collection(config.PRODUCTS);
    console.log("Connected to the products collection successfully");
    return collection;
  } catch (error) {
    console.error("Error connecting to the products collection:", error);
    throw error;
  }
}

async function closeEcomerceDB() {
  try {
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing the database connection:", error);
    throw error;
  }
}


module.exports = { connectEcomerceDB, closeEcomerceDB, connectUsersDB, connectProductsDb};
