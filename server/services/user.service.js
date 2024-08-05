const ecomDB = require("../db/dbConnection");
const { ObjectId } = require('mongodb');

module.exports = {
  registerUser,
  getAllUsers,
  loginUser,
  deleteUser,
  editUser
};

async function registerUser(req, res) {
  try {
    const collection = await ecomDB.connectUsersDB();
    const newUser = req.body;
    await collection.insertOne(newUser);

    res.json({ data: newUser, msg: "User Registered Successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllUsers(req, res) {
  try {
    const collection = await ecomDB.connectUsersDB();

    // const users = await collection
    //   .find({}, { projection: { password: 0 } })
    //   .toArray();
    const users = await collection
      .find({})
      .toArray();

    let totalCount = 0;
    if (users.length > 0) {
      totalCount = users.length;
    }
    res.json({
      data: users,
      totalCount: totalCount,
      msg: "Users Retrieved Successfully",
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


async function deleteUser(req, res) {
  const userId = req.params.id;
  console.log("userId", userId);

  try {
    const collection = await ecomDB.connectUsersDB();
    // const result = await collection.deleteOne({ _id: userId});
    const isExist = await collection.findOne({ _id: new ObjectId(userId) });
    if (isExist) {
      await collection.deleteOne({
        _id: new ObjectId(userId),
      });
      res.status(200).json({ err: false, msg: "User deleted successfully" });
    } else {
      res.status(200).json({ err: true, msg: "User not exist" });
    }
  } catch (error) {
    console.error("Error while deleting user:", error);
    res.status(500).json({ err: true, msg: "Internal Server Error" });
  }
}

async function editUser(req, res) {
  const {
    userId,
    firstName,
    lastName,
    username,
    password,
    email,
    mobile } = req.body;

  const collection = await ecomDB.connectUsersDB();
  if (!userId) {
    return res.status(400).json({ err: true, msg: 'Invalid user ID' });
  }

  const userUpdate = {
    firstName,
    lastName,
    username,
    password,
    email,
    mobile
  };

  const result = await collection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: userUpdate }
  );

  if (result.modifiedCount > 0) {
    res.status(200).json({ err: false, msg: "User Updated successfully" });
  }
  else {
    res.status(500).json({ err: true, msg: "Internal Server Error" });
  }
}

async function loginUser(req, res) {
  const { username, password } = req.body;

  const normalizedUsername = username.toLowerCase();
  const normalizedPassword = password.toLowerCase();

  const predefinedUsername = 'admin';
  const predefinedPassword = 'admin@123';

  try {
    const collection = await ecomDB.connectUsersDB();

    if (normalizedUsername === predefinedUsername && normalizedPassword === predefinedPassword) {
      const existingUser = await collection.findOne({ username: predefinedUsername });
      
      if (!existingUser) {
        const newUser = {
          firstName: "Ram",
          lastName: "Munde",
          email: "rammunde9834@gmail.com",
          username: predefinedUsername,
          password: predefinedPassword,
          mobile:"9834631497",
          role: "Admin"
        };
        await collection.insertOne(newUser);
      }

      const user = await collection.findOne({
        username: predefinedUsername,
        password: predefinedPassword
      });

      if (user) {
        res.status(200).json({ data: user, err: false, msg: "User logged in successfully" });
      } else {
        res.status(401).json({ data: null, err: true, msg: "Please enter correct credentials" });
      }
    } else {
      const user = await collection.findOne({ username, password });
      
      if (user) {
        res.status(200).json({ data: user, err: false, msg: "User logged in successfully" });
      } else {
        res.status(401).json({ data: null, err: true, msg: "Please enter correct credentials" });
      }
    }
  } catch (error) {
    console.error('Error while logging in:', error);
    res.status(500).json({ err: true, msg: 'Internal Server Error' });
  }
}
