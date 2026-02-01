const ecomDB = require("../db/dbConnection");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb');
require('dotenv').config();

module.exports = {
  registerUser,
  getAllUsers,
  getAllAvailableUsers, //POST API
  getAllUserToExport,
  loginUser,
  deleteUser,
  editUser,
  sendMailToOwner
};

async function registerUser(req, res) {
  try {
    const userCollection = await ecomDB.connectUsersDB();
    const { fullName, email, username } = req.body;
    const isDuplicateFieldExist = await verifyAlreadyExist(fullName, email, username, userCollection);
    if (isDuplicateFieldExist) {
      return res.status(400).json({ data: [], msg: 'Duplicate data are not allowed please check fields between name, email and username', err: true });
    }
    const newUser = req.body;
    await userCollection.insertOne(newUser);

    return res.status(200).json({ data: newUser, msg: "User Registered Successfully", err: false });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error", err: true });
  }
}

async function verifyAlreadyExist(fullName, email, username, userCollection) {
  const isExist = await userCollection.findOne({ $or: [{ fullName }, { email }, { username }] });
  return !!isExist;
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

async function getAllAvailableUsers(req, res) {
  try {
    const { searchString = "", sortBy = 'name', sortOrder = 'asc', limit = 10, offset = 0 } = req.body;
    const collection = await ecomDB.connectUsersDB();
    let andArray = [{}];

    if (searchString) {
      andArray.push({ name: { $regex: searchString, $options: "i" } })
    }

    const pipeline = [
      {
        $addFields: {
          name: { $concat: ["$firstName", " ", "$lastName"] }
        }
      }
    ];

    if (andArray.length > 0) {
      pipeline.push({ $match: { $and: andArray } });
    }

    pipeline.push({ $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } });

    const users = await collection.aggregate(pipeline).toArray();

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

async function getAllUserToExport(req, res) {
  try {
    const { searchString = "", sortBy = 'name', sortOrder = 'asc' } = req.body;
    const collection = await ecomDB.connectUsersDB();
    let andArray = [{}];

    if (searchString) {
      andArray.push({ name: { $regex: searchString, $options: "i" } })
    }

    const pipeline = [
      {
        $addFields: {
          name: { $concat: ["$firstName", " ", "$lastName"] }
        }
      }
    ];

    if (andArray.length > 0) {
      pipeline.push({ $match: { $and: andArray } });
    }

    pipeline.push({ $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
      { $project: { _id: 0, name: 1, username: 1, mobile: 1, email: 1 } });

    const users = await collection.aggregate(pipeline).toArray();
    const mapUsers = [];

    for (element of users) {
      let obj = {};
      obj['Name'] = element.name;
      obj['User Name'] = element.username;
      obj['Mobile'] = element.mobile;
      obj['Email'] = element.email;
      mapUsers.push(obj);
    }

    let totalCount = 0;
    if (users.length > 0) {
      totalCount = users.length;
    }

    res.json({
      data: mapUsers,
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
  try {
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

    const result = await collection.updateOne({ _id: new ObjectId(userId) }, { $set: userUpdate });

    res.status(200).json({ err: false, msg: "User Updated successfully" });

  } catch (error) {
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
      const existingUser = await collection.findOne({ username: predefinedUsername, password: predefinedPassword });

      if (!existingUser) {
        const newUser = {
          firstName: "Ram",
          lastName: "Munde",
          fullName: "Ram Munde",
          email: "defaultuser@gmail.com",
          username: predefinedUsername,
          password: predefinedPassword,
          mobile: "9172123412",
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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});


async function sendMailToOwner(req, res) {
  const { name, mobileNo, emailId, message } = req.body;
  try {
    const mailOptions = {
      from: emailId,
      to: emailId, // Replace with your email address
      subject: `Contact Us Message from ${name}`,
      text: `Name: ${name}\nPhone: ${mobileNo}\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ err: true, msg: error.toString() });
      }
      return res.status(200).json({ err: false, msg: "Message Send Successfully" });
    });
  } catch (err) {
    console.log(err);
  }
}