/**
 * Database Migration: Seed initial coding questions
 * Adds basic coding problems for testing
 */

export const seedCodingQuestions = async (connection) => {
    try {
        console.log('Seeding coding questions...');

        // Check if questions already exist
        const [existing] = await connection.query('SELECT COUNT(*) as count FROM coding_questions');
        if (existing[0].count > 0) {
            console.log(`✓ coding_questions table already has ${existing[0].count} questions`);
            return true;
        }

        const questions = [
            {
                title: 'Two Sum',
                description: 'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
                difficulty: 'Easy',
                topic: 'Arrays',
                acceptance: '49.2%',
                tags: JSON.stringify(['Array', 'Hash Table']),
                constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
                sample_test_cases: JSON.stringify([
                    { input: '[2,7,11,15]\n9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
                    { input: '[3,2,4]\n6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' },
                    { input: '[3,3]\n6', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].' }
                ]),
                hidden_test_cases: JSON.stringify([
                    { input: '[2,7,11,15]\n9', output: '[0,1]' },
                    { input: '[3,2,4]\n6', output: '[1,2]' },
                    { input: '[3,3]\n6', output: '[0,1]' },
                    { input: '[1,5,3,7,8,9]\n12', output: '[2,4]' }
                ])
            },
            {
                title: 'Reverse String',
                description: 'Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.',
                difficulty: 'Easy',
                topic: 'String',
                acceptance: '76.8%',
                tags: JSON.stringify(['String', 'Two Pointers']),
                constraints: '1 <= s.length <= 10^5\ns[i] is a printable ascii character.',
                sample_test_cases: JSON.stringify([
                    { input: 'hello', output: 'olleh', explanation: 'The string "hello" becomes "olleh".' },
                    { input: 'Hannah', output: 'hannaH', explanation: 'The string "Hannah" becomes "hannaH".' }
                ]),
                hidden_test_cases: JSON.stringify([
                    { input: 'hello', output: 'olleh' },
                    { input: 'Hannah', output: 'hannaH' },
                    { input: 'a', output: 'a' },
                    { input: 'ab', output: 'ba' }
                ])
            },
            {
                title: 'Valid Palindrome',
                description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise.',
                difficulty: 'Easy',
                topic: 'String',
                acceptance: '44.1%',
                tags: JSON.stringify(['String', 'Two Pointers']),
                constraints: '1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.',
                sample_test_cases: JSON.stringify([
                    { input: 'A man, a plan, a canal: Panama', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
                    { input: 'race a car', output: 'false', explanation: '"raceacar" is not a palindrome.' },
                    { input: ' ', output: 'true', explanation: 's is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.' }
                ]),
                hidden_test_cases: JSON.stringify([
                    { input: 'A man, a plan, a canal: Panama', output: 'true' },
                    { input: 'race a car', output: 'false' },
                    { input: ' ', output: 'true' },
                    { input: '0P', output: 'false' }
                ])
            },
            {
                title: 'Add Two Numbers',
                description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list. You may assume the two numbers do not contain any leading zero, except the number 0 itself.',
                difficulty: 'Medium',
                topic: 'Linked List',
                acceptance: '40.8%',
                tags: JSON.stringify(['Linked List', 'Math', 'Recursion']),
                constraints: 'The number of nodes in each linked list is in the range [1, 100].\n0 <= Node.val <= 9\nIt is guaranteed that the list represents a number that does not have leading zeros.',
                sample_test_cases: JSON.stringify([
                    { input: '[2,4,3]\n[5,6,4]', output: '[7,0,8]', explanation: '342 + 465 = 807.' },
                    { input: '[0]\n[0]', output: '[0]', explanation: '0 + 0 = 0.' },
                    { input: '[9,9,9,9,9,9,9]\n[9,9,9,9]', output: '[8,9,9,9,0,0,0,1]', explanation: '9999999 + 9999 = 10009998.' }
                ]),
                hidden_test_cases: JSON.stringify([
                    { input: '[2,4,3]\n[5,6,4]', output: '[7,0,8]' },
                    { input: '[0]\n[0]', output: '[0]' },
                    { input: '[9,9,9,9,9,9,9]\n[9,9,9,9]', output: '[8,9,9,9,0,0,0,1]' }
                ])
            },
            {
                title: 'Longest Substring Without Repeating Characters',
                description: 'Given a string s, find the length of the longest substring without repeating characters.',
                difficulty: 'Medium',
                topic: 'String',
                acceptance: '33.8%',
                tags: JSON.stringify(['Hash Table', 'String', 'Sliding Window']),
                constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
                sample_test_cases: JSON.stringify([
                    { input: 'abcabcbb', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
                    { input: 'bbbbb', output: '1', explanation: 'The answer is "b", with the length of 1.' },
                    { input: 'pwwkew', output: '3', explanation: 'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.' }
                ]),
                hidden_test_cases: JSON.stringify([
                    { input: 'abcabcbb', output: '3' },
                    { input: 'bbbbb', output: '1' },
                    { input: 'pwwkew', output: '3' },
                    { input: '', output: '0' },
                    { input: 'au', output: '2' }
                ])
            }
        ];

        for (const question of questions) {
            await connection.query(
                `INSERT INTO coding_questions 
         (title, description, difficulty, topic, acceptance, tags, constraints, sample_test_cases, hidden_test_cases) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    question.title,
                    question.description,
                    question.difficulty,
                    question.topic,
                    question.acceptance,
                    question.tags,
                    question.constraints,
                    question.sample_test_cases,
                    question.hidden_test_cases
                ]
            );
        }

        console.log(`✓ Seeded ${questions.length} coding questions`);
        return true;
    } catch (error) {
        console.error('Error seeding coding questions:', error);
        throw error;
    }
};

export default seedCodingQuestions;
