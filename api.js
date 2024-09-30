const axios = require('axios');

// Function to prettify user data from the LeetCode API
function prettifyUserData(userData) {
    const prettifiedData = {
        Username: userData.username,
        'Accepted Submissions': {}
    };

    userData.submitStats.acSubmissionNum.forEach(submission => {
        const difficulty = submission.difficulty.charAt(0).toUpperCase() + submission.difficulty.slice(1);
        prettifiedData['Accepted Submissions'][difficulty] = submission.count;
    });

    return prettifiedData;
}

// Function to fetch LeetCode user data based on username
async function getLeetcodeUserData(username) {
    const url = 'https://leetcode.com/graphql';
    const headers = {
        'Content-Type': 'application/json',
        // 'Cookie': 'LEETCODE_SESSION=your_session_cookie',  // Uncomment and replace if needed
    };

    const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
    `;

    const variables = { username };

    try {
        const response = await axios.post(url, {
            query: query,
            variables: variables
        }, { headers });

        if (response.status !== 200) {
            throw new Error(`Query failed with status code ${response.status}: ${response.data}`);
        }

        const data = response.data;

        if (data.errors) {
            throw new Error(`Errors returned: ${data.errors}`);
        }

        return prettifyUserData(data.data.matchedUser);
    } catch (err) {
        console.error(`Error fetching user data: ${err.message}`);
        throw err;
    }
}

// Function to fetch a list of problems for a given category
async function getProblemsList(category, skip) {
    const url = 'https://leetcode.com/graphql';
    const headers = {
        'Content-Type': 'application/json'
    };

    const query = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(categorySlug: $categorySlug limit: $limit skip: $skip filters: $filters) {
        total: totalNum
        questions: data {
          frontendQuestionId
          isFavor
          paidOnly
          title
          titleSlug
          topicTags {
            name
            slug
          }
        }
      }
    }
    `;

    const variables = {
        categorySlug: 'all-code-essentials',
        skip: skip,
        limit: 1,
        filters: {
            tags: [category]
        }
    };

    try {
        const response = await axios.post(url, {
            query: query,
            variables: variables
        }, { headers });

        if (response.status !== 200) {
            throw new Error(`Query failed with status code ${response.status}: ${response.data}`);
        }

        const data = response.data;

        if (data.errors) {
            throw new Error(`Errors returned: ${data.errors}`);
        }

        const questionData = data.data.problemsetQuestionList.questions[0];

        return !questionData.paidOnly
            ? { title: questionData.title, titleSlug: questionData.titleSlug }
            : null;
    } catch (err) {
        console.error(`Error fetching problem list: ${err.message}`);
        throw err;
    }
}

// Test the functions
(async () => {
    try {
        const category = 'array';
        const problem = await getProblemsList(category, 0);
        console.log(problem);

        const userData = await getLeetcodeUserData('your_leetcode_username');
        console.log(userData);
    } catch (err) {
        console.error(err);
    }
})();

module.exports = { getLeetcodeUserData, getProblemsList };