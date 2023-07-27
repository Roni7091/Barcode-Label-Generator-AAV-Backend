// backend code for sending email

// const express = require("express");
// const nodemailer = require("nodemailer");
// const cors = require("cors");
// const multer = require("multer");

// const app = express();
// const PORT = 5000; // Replace with the port you want to use

// // Enable CORS for cross-origin requests
// app.use(cors());

// // Parse JSON and form data
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Create a Nodemailer transporter with your email service credentials
// const transporter = nodemailer.createTransport({
//   service: "Gmail", // Replace with your email service (e.g., Gmail, Outlook, etc.)
//   auth: {
//     user: "spoken.0987@gmail.com", // Replace with your email address
//     pass: "gtomtduwhtmlifpr", // Replace with your email password
//   },
// });

// // Configure multer to handle file uploads
// const upload = multer({
//   dest: "uploads/",
//   limits: {
//     fileSize: 5 * 1024 * 1024, // Maximum file size (5MB in this example)
//   },
// });

// // POST endpoint to handle form data and send email
// app.post("/send-email", upload.single("image"), (req, res) => {
//   const { name, email, message } = req.body;
//   const imageFile = req.file;

//   const mailOptions = {
//     from: "spoken.0987@gmail.com", // Replace with your email address
//     to: email,
//     subject: "Template Review",
//     text: message,
//     attachments: [
//       {
//         filename: "design.jpg",
//         path: imageFile.path,
//       },
//     ],
//   };

//   // Send email
//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error("Error sending email:", error);
//       res.status(500).json({ error: "Failed to send email" });
//     } else {
//       console.log("Email sent:", info.response);
//       res.status(200).json({ message: "Email sent successfully" });
//     }
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });


// Merged code

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/barcodeapi?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// User registration route
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// User login route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, "secretKey", { expiresIn: "2h" });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a Nodemailer transporter with your email service credentials
const transporter = nodemailer.createTransport({
  service: "Gmail", // Replace with your email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: "email", // Replace with your email address
    pass: "create app password", // Replace with your email password
  },
});

// Configure multer to handle file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum file size (5MB in this example)
  },
});

// POST endpoint to handle form data and send email
app.post("/send-email", upload.single("image"), (req, res) => {
  const { name, email, message } = req.body;
  const imageFile = req.file;

  const mailOptions = {
    from: "email", // Replace with your email address
    to: email,
    subject: "Template Review",
    text: message,
    attachments: [
      {
        filename: "design.jpg",
        path: imageFile.path,
      },
    ],
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    } else {
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Email sent successfully" });
    }
  });
});

const PORT = 5000; // Replace with the port you want to use

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
