import axios from 'axios';
import { randomUUID } from 'crypto';
import { query } from '../db/index.js';
import { executeLocal, isLocallySupported } from './localCompiler.js';

// Configuration
const USE_LOCAL_COMPILER = process.env.USE_LOCAL_COMPILER === 'true';
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST;

// Language Mapping (Monaco/UI -> Judge0 ID)
const LANGUAGE_MAP = {
    javascript: 63,
    python: 71,
    cpp: 54,
    c: 50,
    java: 62,
    go: 60,
};

/**
 * Execute code using Judge0 API
 */
const executeViaJudge0 = async (source_code, language, stdin = '') => {
    const language_id = LANGUAGE_MAP[language.toLowerCase()];
    if (!language_id) throw new Error(`Unsupported language: ${language}`);

    const payload = { source_code, language_id, stdin };
    const params = { base64_encoded: 'false', wait: 'true' };
    const headers = { 'Content-Type': 'application/json' };

    if (JUDGE0_API_KEY) {
        headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
        if (JUDGE0_API_HOST) headers['X-RapidAPI-Host'] = JUDGE0_API_HOST;
    }

    const response = await axios.post(`${JUDGE0_API_URL}/submissions`, payload, { params, headers });
    const result = response.data;

    return {
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        message: result.message,
        status: result.status,
        time: result.time,
        memory: result.memory
    };
};

/**
 * Execute code - uses local compiler if available and enabled, otherwise Judge0
 */
export const executeCode = async (source_code, language, stdin = '') => {
    const lang = language.toLowerCase();

    // Try local execution if enabled and supported
    if (USE_LOCAL_COMPILER && isLocallySupported(lang)) {
        console.log(`[Compiler] Using LOCAL compiler for ${lang}`);
        try {
            return await executeLocal(source_code, lang, stdin);
        } catch (localError) {
            console.warn(`[Compiler] Local execution failed, falling back to Judge0:`, localError.message);
        }
    }

    // Fall back to Judge0
    console.log(`[Compiler] Using Judge0 API for ${lang}`);
    try {
        return await executeViaJudge0(source_code, language, stdin);
    } catch (error) {
        if (error.response) {
            console.error('Judge0 API Error:', error.response.status, error.response.data);
            throw new Error(`Compiler API Error: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error('Judge0 Network Error:', error.message);
            throw new Error('Compiler Service Unavailable');
        }
    }
};

/**
 * Run code against a test suite and return detailed results
 * This is used for battles and practice mode to show test case results
 */
export const runTestSuite = async (source_code, language, testCases = []) => {
    try {
        if (!Array.isArray(testCases) || testCases.length === 0) {
            throw new Error('No test cases provided');
        }

        let passedCount = 0;
        let totalTime = 0;
        let totalMemory = 0;
        let verdict = 'ACCEPTED';
        let testResults = [];
        let firstError = null;

        console.log(`[TestSuite] Running ${testCases.length} test cases for ${language}`);

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const tcInput = typeof tc === 'string' ? tc : (tc.input || '');
            const tcExpected = typeof tc === 'string' ? '' : (tc.output || '');

            try {
                const result = await executeCode(source_code, language, tcInput);

                const actual = (result.stdout || '').trim();
                const expected = tcExpected.trim();
                const passed = actual === expected;

                // Check for runtime errors
                if (result.status && result.status.id !== 3) {
                    verdict = result.status.description?.toUpperCase().replace(/ /g, '_') || 'RUNTIME_ERROR';
                    testResults.push({
                        testCase: i + 1,
                        passed: false,
                        input: tcInput,
                        expected: tcExpected,
                        actual: actual,
                        status: verdict,
                        time: result.time,
                        memory: result.memory,
                        error: result.stderr || result.compile_output
                    });
                    if (!firstError) firstError = result.stderr || result.compile_output || 'Runtime error';
                    break; // Stop on first error
                }

                if (passed) {
                    passedCount++;
                    totalTime += parseFloat(result.time || 0);
                    totalMemory += parseFloat(result.memory || 0);
                } else {
                    verdict = 'WRONG_ANSWER';
                }

                testResults.push({
                    testCase: i + 1,
                    passed,
                    input: tcInput,
                    expected: tcExpected,
                    actual: actual,
                    status: passed ? 'PASSED' : 'WRONG_ANSWER',
                    time: result.time,
                    memory: result.memory
                });

                // Stop on first failure (optional - can be changed to run all)
                if (!passed) {
                    break;
                }

            } catch (execError) {
                verdict = 'COMPILATION_ERROR';
                testResults.push({
                    testCase: i + 1,
                    passed: false,
                    input: tcInput,
                    expected: tcExpected,
                    actual: '',
                    status: 'ERROR',
                    error: execError.message
                });
                if (!firstError) firstError = execError.message;
                break;
            }
        }

        return {
            success: true,
            verdict,
            testCasesPassed: passedCount,
            testCasesTotal: testCases.length,
            executionTime: totalTime,
            memoryUsage: totalMemory,
            testResults,
            error: firstError
        };

    } catch (error) {
        console.error('Test Suite Error:', error);
        return {
            success: false,
            verdict: 'ERROR',
            testCasesPassed: 0,
            testCasesTotal: testCases.length,
            error: error.message,
            testResults: []
        };
    }
};

/**
 * Judge submission against all test cases
 */
/**
 * Judge submission against all test cases
 */
export const judgeSubmission = async (userId, problemId, source_code, language, saveToDb = true) => {
    try {
        // Get test cases from coding_questions
        const questions = await query('SELECT hidden_test_cases FROM coding_questions WHERE id = ?', [problemId]);
        if (questions.length === 0) throw new Error('Problem not found');

        const testCases = questions[0].hidden_test_cases || [];
        if (testCases.length === 0) throw new Error('No test cases found for this problem');

        let passedCount = 0;
        let totalTime = 0;
        let totalMemory = 0;
        let finalStatus = 'ACCEPTED';
        let failedCase = null;
        let compileOutput = '';
        let stdout = '';
        let stderr = '';

        for (const tc of testCases) {
            const result = await executeCode(source_code, language, tc.input);

            // Accumulate logs (using the last run's output for simplicity, or could concatenate)
            stdout = result.stdout || '';
            stderr = result.stderr || '';
            compileOutput = result.compile_output || '';

            const actual = (result.stdout || '').trim();
            const expected = (tc.output || '').trim();

            if (result.status.id !== 3) {
                finalStatus = result.status.description?.toUpperCase().replace(/ /g, '_') || 'ERROR';
                failedCase = tc;
                // Don't break immediately if we want to run all cases? 
                // Usually for judging we break on first fail to save resources.
                break;
            }

            if (actual !== expected) {
                finalStatus = 'WRONG_ANSWER';
                failedCase = { ...tc, actual, expected };
                break;
            }

            passedCount++;
            totalTime += parseFloat(result.time || 0);
            totalMemory += parseFloat(result.memory || 0);
        }

        const stats = {
            executionTime: totalTime,
            memoryUsage: totalMemory,
            testCasesPassed: passedCount,
            testCasesTotal: testCases.length,
            verdict: finalStatus,
            stdout,
            stderr,
            compileOutput
        };

        if (saveToDb) {
            const submissionId = randomUUID();
            await query(
                `INSERT INTO submissions 
                (id, user_id, problem_id, code, language, status, execution_time, memory_usage, test_cases_passed, test_cases_total)
                VALUES (?, (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [submissionId, userId, problemId, source_code, language, finalStatus, totalTime, totalMemory, passedCount, testCases.length]
            );
            return {
                success: true,
                submissionId,
                ...stats,
                failedCase
            };
        }

        return {
            success: true,
            ...stats,
            failedCase
        };

    } catch (error) {
        console.error('Judge Submission Error:', error);
        throw error;
    }
};
