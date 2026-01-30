import { spawn, execSync } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

// Compiler configuration
const COMPILERS = {
    python: { cmd: 'python', args: [], extension: '.py', compiled: false },
    java: { cmd: 'javac', runCmd: 'java', extension: '.java', compiled: true },
    c: { cmd: 'gcc', args: ['-o'], extension: '.c', compiled: true },
    cpp: { cmd: 'g++', args: ['-o'], extension: '.cpp', compiled: true },
    javascript: { cmd: 'node', args: [], extension: '.js', compiled: false }
};

// Timeout in milliseconds
const EXECUTION_TIMEOUT = 10000; // 10 seconds

// Available compilers (set at startup)
const availableCompilers = {};

/**
 * Check which compilers are available on the system
 */
export const checkCompilers = () => {
    console.log('🔍 Checking local compilers...');

    const checks = [
        { name: 'python', cmd: 'python --version' },
        { name: 'java', cmd: 'javac -version' },
        { name: 'javascript', cmd: 'node --version' },
        { name: 'c', cmd: 'gcc --version' },
        { name: 'cpp', cmd: 'g++ --version' }
    ];

    for (const check of checks) {
        try {
            const result = execSync(check.cmd, { encoding: 'utf8', timeout: 5000, stdio: 'pipe' });
            availableCompilers[check.name] = true;
            console.log(`   ✅ ${check.name}: Available`);
        } catch (e) {
            availableCompilers[check.name] = false;
            console.log(`   ❌ ${check.name}: Not found`);
        }
    }

    return availableCompilers;
};

/**
 * Check if a language is supported locally
 */
export const isLocallySupported = (language) => {
    return availableCompilers[language.toLowerCase()] === true;
};

/**
 * Execute code locally
 */
export const executeLocal = async (sourceCode, language, stdin = '') => {
    const lang = language.toLowerCase();

    if (!availableCompilers[lang]) {
        throw new Error(`Language '${lang}' is not available locally`);
    }

    const config = COMPILERS[lang];
    if (!config) {
        throw new Error(`Unsupported language: ${lang}`);
    }

    // Create isolated temp directory
    const execId = randomUUID();
    const tempDir = join(tmpdir(), 'codeverse', execId);
    mkdirSync(tempDir, { recursive: true });

    try {
        if (config.compiled) {
            return await compileAndRun(sourceCode, lang, stdin, tempDir, config);
        } else {
            return await runInterpreted(sourceCode, lang, stdin, tempDir, config);
        }
    } finally {
        // Cleanup temp directory
        try {
            rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
            console.warn('Failed to cleanup temp dir:', tempDir);
        }
    }
};

/**
 * Run interpreted languages (Python, Node.js)
 */
const runInterpreted = async (sourceCode, language, stdin, tempDir, config) => {
    const filename = `main${config.extension}`;
    const filepath = join(tempDir, filename);

    // Write source code
    writeFileSync(filepath, sourceCode, 'utf8');

    // Execute
    return new Promise((resolve) => {
        const startTime = Date.now();
        const args = [...config.args, filepath];
        const proc = spawn(config.cmd, args, { cwd: tempDir, timeout: EXECUTION_TIMEOUT });

        let stdout = '';
        let stderr = '';
        let killed = false;

        // Send stdin if provided
        if (stdin) {
            proc.stdin.write(stdin);
        }
        proc.stdin.end();

        proc.stdout.on('data', (data) => { stdout += data.toString(); });
        proc.stderr.on('data', (data) => { stderr += data.toString(); });

        // Timeout handler
        const timeout = setTimeout(() => {
            killed = true;
            proc.kill('SIGKILL');
        }, EXECUTION_TIMEOUT);

        proc.on('close', (code) => {
            clearTimeout(timeout);
            const execTime = ((Date.now() - startTime) / 1000).toFixed(2);

            if (killed) {
                resolve({
                    stdout: stdout.slice(0, 10000),
                    stderr: 'Execution timed out',
                    compile_output: null,
                    message: 'Time Limit Exceeded',
                    status: { id: 5, description: 'Time Limit Exceeded' },
                    time: execTime,
                    memory: null
                });
            } else {
                resolve({
                    stdout: stdout.slice(0, 10000),
                    stderr: stderr.slice(0, 5000) || null,
                    compile_output: null,
                    message: null,
                    status: { id: code === 0 ? 3 : 11, description: code === 0 ? 'Accepted' : 'Runtime Error' },
                    time: execTime,
                    memory: null
                });
            }
        });

        proc.on('error', (err) => {
            clearTimeout(timeout);
            resolve({
                stdout: null,
                stderr: err.message,
                compile_output: null,
                message: 'Execution failed',
                status: { id: 11, description: 'Runtime Error' },
                time: null,
                memory: null
            });
        });
    });
};

/**
 * Compile and run (Java, C, C++)
 */
const compileAndRun = async (sourceCode, language, stdin, tempDir, config) => {
    let filename, filepath, outputPath, runCmd, runArgs;

    if (language === 'java') {
        // Extract class name from code
        const classMatch = sourceCode.match(/public\s+class\s+(\w+)/);
        const className = classMatch ? classMatch[1] : 'Main';
        filename = `${className}.java`;
        filepath = join(tempDir, filename);
        outputPath = null; // Java uses .class files
        runCmd = 'java';
        runArgs = [className];
    } else {
        // C/C++
        filename = `main${config.extension}`;
        filepath = join(tempDir, filename);
        outputPath = join(tempDir, 'main.exe');
        runCmd = outputPath;
        runArgs = [];
    }

    // Write source code
    writeFileSync(filepath, sourceCode, 'utf8');

    // Compile
    const compileResult = await new Promise((resolve) => {
        let compileArgs;
        if (language === 'java') {
            compileArgs = [filepath];
        } else {
            compileArgs = [filepath, '-o', outputPath];
        }

        const proc = spawn(config.cmd, compileArgs, { cwd: tempDir, timeout: EXECUTION_TIMEOUT });
        let compileOutput = '';

        proc.stdout.on('data', (data) => { compileOutput += data.toString(); });
        proc.stderr.on('data', (data) => { compileOutput += data.toString(); });

        proc.on('close', (code) => {
            resolve({ success: code === 0, output: compileOutput });
        });

        proc.on('error', (err) => {
            resolve({ success: false, output: err.message });
        });
    });

    if (!compileResult.success) {
        return {
            stdout: null,
            stderr: null,
            compile_output: compileResult.output.slice(0, 5000),
            message: 'Compilation Error',
            status: { id: 6, description: 'Compilation Error' },
            time: null,
            memory: null
        };
    }

    // Run compiled code
    return new Promise((resolve) => {
        const startTime = Date.now();
        const proc = spawn(runCmd, runArgs, { cwd: tempDir, timeout: EXECUTION_TIMEOUT });

        let stdout = '';
        let stderr = '';
        let killed = false;

        if (stdin) {
            proc.stdin.write(stdin);
        }
        proc.stdin.end();

        proc.stdout.on('data', (data) => { stdout += data.toString(); });
        proc.stderr.on('data', (data) => { stderr += data.toString(); });

        const timeout = setTimeout(() => {
            killed = true;
            proc.kill('SIGKILL');
        }, EXECUTION_TIMEOUT);

        proc.on('close', (code) => {
            clearTimeout(timeout);
            const execTime = ((Date.now() - startTime) / 1000).toFixed(2);

            if (killed) {
                resolve({
                    stdout: stdout.slice(0, 10000),
                    stderr: 'Execution timed out',
                    compile_output: null,
                    message: 'Time Limit Exceeded',
                    status: { id: 5, description: 'Time Limit Exceeded' },
                    time: execTime,
                    memory: null
                });
            } else {
                resolve({
                    stdout: stdout.slice(0, 10000),
                    stderr: stderr.slice(0, 5000) || null,
                    compile_output: null,
                    message: null,
                    status: { id: code === 0 ? 3 : 11, description: code === 0 ? 'Accepted' : 'Runtime Error' },
                    time: execTime,
                    memory: null
                });
            }
        });

        proc.on('error', (err) => {
            clearTimeout(timeout);
            resolve({
                stdout: null,
                stderr: err.message,
                compile_output: null,
                message: 'Execution failed',
                status: { id: 11, description: 'Runtime Error' },
                time: null,
                memory: null
            });
        });
    });
};

export default { checkCompilers, isLocallySupported, executeLocal };
