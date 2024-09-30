const { getLeetcodeUserData } = require('./api');
const UserSubmission = require('./models/userSubmission'); // Assuming the model is exported from models/userSubmission.js

async function updateLeetcodeData() {
    /**
     * Function to update user data in the database (MongoDB version)
     */
    try {
        // Fetch all usernames from MongoDB
        const users = await UserSubmission.find({}, 'username');

        for (let user of users) {
            try {
                // Fetch LeetCode data for each username
                const username = user.username;
                const userData = await getLeetcodeUserData(username);
                if (!userData) continue;

                // Extract submission data
                const easy = userData['Accepted Submissions']?.Easy || 0;
                const medium = userData['Accepted Submissions']?.Medium || 0;
                const hard = userData['Accepted Submissions']?.Hard || 0;
                const total = userData['Accepted Submissions']?.All || 0;

                // Update the user data in MongoDB
                await UserSubmission.findOneAndUpdate(
                    { username: username },
                    { easy, medium, hard, total },
                    { new: true } // Return the updated document
                );
            } catch (err) {
                console.error(`Error updating user ${user.username}:`, err);
            }
        }
        console.log('Data updated successfully');
    } catch (err) {
        console.error('Error updating data:', err);
    }
}

module.exports = { updateLeetcodeData };