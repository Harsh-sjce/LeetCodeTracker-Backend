require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

// Define the user submissions schema
const userSubmissionSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

// Create the model from the schema
const UserSubmission = mongoose.model('UserSubmission', userSubmissionSchema);

// Function to create the database (MongoDB does not require explicit table creation)
const createDatabase = async () => {
  console.log('MongoDB database does not require explicit table creation.');
};

// Function to insert or update user data into MongoDB
const insertUserData = async (userData) => {
  try {
    const { Username, 'Accepted Submissions': { Easy = 0, Medium = 0, Hard = 0, All = 0 } } = userData;

    const result = await UserSubmission.findOneAndUpdate(
      { username: Username },
      { easy: Easy, medium: Medium, hard: Hard, total: All },
      { upsert: true, new: true } // upsert creates a new document if none exists
    );

    console.log('User data inserted/updated:', result);
  } catch (err) {
    console.error('Error inserting/updating user data:', err);
  }
};

// Function to fetch all user data from MongoDB
const getAllUserData = async () => {
  try {
    const allUsers = await UserSubmission.find({});
    return allUsers;
  } catch (err) {
    console.error('Error fetching user data:', err);
    return [];
  }
};

// Example usage for testing purposes
const exampleUserData = {
  Username: 'example_user',
  'Accepted Submissions': {
    Easy: 10,
    Medium: 5,
    Hard: 2,
    All: 17,
  },
};

// Main function to test the database functions
(async () => {
  await connectToDatabase();  // Connect to MongoDB
  await createDatabase();     // MongoDB does not need explicit database creation
  await insertUserData(exampleUserData); // Insert example user data
  const allUserData = await getAllUserData();  // Fetch all user data
  console.log(allUserData);
})();