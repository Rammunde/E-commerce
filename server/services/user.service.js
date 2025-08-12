const ecomDB = require("../db/dbConnection");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb');
require('dotenv').config();

module.exports = {
  registerUser,
  getAllUsers,
  getAllAvailableUsers, //POST API
  loginUser,
  deleteUser,
  editUser,
  sendMailToOwner
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

async function getAllAvailableUsers(req, res) {
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

    pipeline.push({$sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 }});

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
      const existingUser = await collection.findOne({ username: predefinedUsername, password: predefinedPassword });

      if (!existingUser) {
        const newUser = {
          firstName: "Ram",
          lastName: "Munde",
          email: "rammunde9834@gmail.com",
          username: predefinedUsername,
          password: predefinedPassword,
          mobile: "9834631497",
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