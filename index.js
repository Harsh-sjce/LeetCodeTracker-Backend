require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(cors());

const SECRET_TOKEN = process.env.SECRET_TOKEN;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
 // useNewUrlParser: true,
  //useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// Define user submission schema
const userSubmissionSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
});

// Create the user submission model
const UserSubmission = mongoose.model('UserSubmission', userSubmissionSchema);

// Route to check server health
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Fetch all user data from the database
app.get('/all_users', async (req, res) => {
  try {
    const data = await UserSubmission.find({});
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add user data fetched from LeetCode
app.post('/add_user', async (req, res) => {
  const { username } = req.body;
  const token = req.headers.authorization;

  if (token !== `Bearer ${SECRET_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized Access' });
  }

  try {
    const userData = await getLeetcodeUserData(username); // Implement this function to fetch from LeetCode
    const { Easy, Medium, Hard, All } = userData['Accepted Submissions'];

    const newUserSubmission = {
      username: userData.Username,
      easy: Easy,
      medium: Medium,
      hard: Hard,
      total: All
    };

    // Insert or update the user submission in MongoDB
    await UserSubmission.findOneAndUpdate(
      { username: username },
      newUserSubmission,
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Data added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch leaderboard based on total questions solved
app.get('/leaderboard/:type', async (req, res) => {
  const { type } = req.params;

  try {
    const data = await UserSubmission.find({}).sort({ [type]: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch random problems for each category (example for random problem fetching)
app.get('/daily', (req, res) => {
  try {
    const problems = {
      Arrays: getRandomProblem('array', 1697),
      String: getRandomProblem('string', 711),
      Tree: getRandomProblem('tree', 230),
      Graph: getRandomProblem('graph', 143),
      DynamicProgramming: getRandomProblem('dynamic-programming', 143),
      Database: getRandomProblem('database', 277),
    };
    res.status(200).json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Function to fetch random problems (implementation needed based on LeetCode API or stored problems)
function getRandomProblem(category, totalProblems) {
  const seed = Math.floor(Math.random() * totalProblems);
  return { category, seed }; // Placeholder response
}

// Update LeetCode data (cron job functionality)
app.get('/update', (req, res) => {
  updateLeetcodeData(); // Implement this function to update data in the database
  res.status(200).json({ message: 'Data updated successfully' });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});