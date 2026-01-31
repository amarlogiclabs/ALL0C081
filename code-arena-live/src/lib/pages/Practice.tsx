import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CodeEditor, Language, getDefaultCode } from "@/components/CodeEditor";
import {
  BookOpen,
  Search,
  CheckCircle2,
  Circle,
  ChevronRight,
  Code,
  Play,
  Send,
  Loader2,
  X,
  Settings,
  Clock,
  User,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";

// 10 Practice Problems with Full Details
const mockProblems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    acceptance: "49.2%",
    description: "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9, so we return [0, 1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "nums[1] + nums[2] == 6, so we return [1, 2]" }
    ],
    constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9"
  },
  {
    id: 2,
    title: "Reverse String",
    difficulty: "Easy",
    topic: "Strings",
    acceptance: "85.1%",
    description: "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
    ],
    constraints: "1 <= s.length <= 10^5, s[i] is a printable ascii character"
  },
  {
    id: 3,
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack",
    acceptance: "40.3%",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Every open bracket must be closed by a same type of closing bracket, and every closing bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" }
    ],
    constraints: "1 <= s.length <= 10^4, s consists of parentheses only '()[]{}'"
  },
  {
    id: 4,
    title: "Merge Sorted Array",
    difficulty: "Easy",
    topic: "Arrays",
    acceptance: "46.6%",
    description: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of valid elements in nums1 and nums2 respectively. Merge nums2 into nums1 as one sorted array.",
    examples: [
      { input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", output: "[1,2,2,3,5,6]" },
      { input: "nums1 = [1], m = 1, nums2 = [], n = 0", output: "[1]" }
    ],
    constraints: "nums1.length == m + n, nums2.length == n, 0 <= m, n <= 200"
  },
  {
    id: 5,
    title: "Contains Duplicate",
    difficulty: "Easy",
    topic: "Hash Table",
    acceptance: "62.5%",
    description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "true" },
      { input: "nums = [1,2,3,4]", output: "false" },
      { input: "nums = [99,99]", output: "true" }
    ],
    constraints: "1 <= nums.length <= 10^5, -10^9 <= nums[i] <= 10^9"
  },
  {
    id: 6,
    title: "Climbing Stairs",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    acceptance: "51.3%",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    examples: [
      { input: "n = 2", output: "2", explanation: "1. 1 step + 1 step 2. 2 steps" },
      { input: "n = 3", output: "3", explanation: "1. 1 step + 1 step + 1 step 2. 1 step + 2 steps 3. 2 steps + 1 step" }
    ],
    constraints: "1 <= n <= 45"
  },
  {
    id: 7,
    title: "Binary Search",
    difficulty: "Medium",
    topic: "Binary Search",
    acceptance: "52.0%",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 13", output: "-1" }
    ],
    constraints: "1 <= nums.length <= 10^4, -10^4 < nums[i], target < 10^4, all elements in nums are unique"
  },
  {
    id: 8,
    title: "Longest Palindrome",
    difficulty: "Medium",
    topic: "Strings",
    acceptance: "33.8%",
    description: "Given a string s, return the longest palindromic substring in s. A string is palindromic if it reads the same backward as forward.",
    examples: [
      { input: 's = "babad"', output: '"bab" or "aba"' },
      { input: 's = "cbbd"', output: '"bb"' }
    ],
    constraints: "1 <= s.length <= 1000, s consist of only digits and English letters"
  },
  {
    id: 9,
    title: "Maximum Subarray",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    acceptance: "47.5%",
    description: "Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum. A subarray is a contiguous part of an array.",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1] has the largest sum = 6" },
      { input: "nums = [5,4,-1,7,8]", output: "23", explanation: "The entire array [5,4,-1,7,8] has the largest sum" }
    ],
    constraints: "1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4"
  },
  {
    id: 10,
    title: "Rotate Array",
    difficulty: "Medium",
    topic: "Arrays",
    acceptance: "39.2%",
    description: "Given an integer array nums, rotate the array to the right by k steps, where k is non-negative. Do this in-place with O(1) extra space.",
    examples: [
      { input: "nums = [1,2,3,4,5,6,7], k = 3", output: "[5,6,7,1,2,3,4]" },
      { input: "nums = [-1,-100,3,99], k = 2", output: "[3,99,-1,-100]" }
    ],
    constraints: "1 <= nums.length <= 10^5, -2^31 <= nums[i] <= 2^31 - 1, 0 <= k <= 10^5"
  }
];


interface LiveBattleInterfaceProps {
  problem: typeof mockProblems[0];
  isOpen: boolean;
  onClose: () => void;
  onSolved?: () => void;
}

function LiveBattleInterface({ problem, isOpen, onClose, onSolved }: LiveBattleInterfaceProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("python");
  const [code, setCode] = useState(getDefaultCode(selectedLanguage));
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState("");
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [compilerInfo, setCompilerInfo] = useState<any>(null);

  // Fetch Compiler Info
  useEffect(() => {
    const fetchCompilerInfo = async () => {
      try {
        const response = await api.get('/api/compiler/info');
        if (response.ok) {
          const data = await response.json();
          setCompilerInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch compiler info:", error);
      }
    };
    if (isOpen) fetchCompilerInfo();
  }, [isOpen]);

  // Timer countdown - Removed auto-start for practice mode
  // Timer is now just for display, doesn't auto-countdown

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLanguageChange = (newLang: Language) => {
    setSelectedLanguage(newLang);
    setCode(getDefaultCode(newLang));
  };

  const handleRun = async () => {
    setIsRunning(true);
    setConsoleOutput("Running test cases...\n");
    setTestResults([]);

    try {
      // Use problem.id as problemId for the API call
      const res = await api.post('/api/practice/run', {
        problemId: problem.id,
        code,
        language: selectedLanguage
      });
      const data = await res.json();

      if (data.success && data.result) {
        const { verdict, stdout, stderr, compileOutput, testResults: tcResults, testCasesPassed, testCasesTotal } = data.result;

        let output = '';

        if (compileOutput) {
          output += `Compile Output:\n${compileOutput}\n\n`;
        }

        if (stderr) {
          output += `Errors:\n${stderr}\n\n`;
        }

        if (stdout) {
          output += `Output:\n${stdout}\n\n`;
        }

        output += `Verdict: ${verdict}\n`;
        output += `Test Cases: ${testCasesPassed}/${testCasesTotal} passed\n`;

        setConsoleOutput(output);
        setTestResults(tcResults || []);
      } else {
        setConsoleOutput("Error: " + (data.error || "Failed to run code"));
      }
    } catch (error) {
      console.error("Run error:", error);
      setConsoleOutput("Network error: Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setConsoleOutput("Submitting solution...\n");
    setTestResults([]);

    try {
      const res = await api.post('/api/practice/submit', {
        problemId: problem.id,
        code,
        language: selectedLanguage
      });
      const data = await res.json();

      if (data.success && data.result) {
        const { verdict, stdout, stderr, compileOutput, testResults: tcResults, testCasesPassed, testCasesTotal, executionTime, memoryUsage } = data.result;

        let output = '';

        if (compileOutput) {
          output += `Compile Output:\n${compileOutput}\n\n`;
        }

        if (stderr) {
          output += `Errors:\n${stderr}\n\n`;
        }

        if (stdout) {
          output += `Output:\n${stdout}\n\n`;
        }

        if (verdict === 'ACCEPTED') {
          output += `✓ All test cases passed!\n`;
          output += `✓ Accepted\n`;
          setSubmitted(true);
          onSolved?.();
        } else {
          output += `✗ Verdict: ${verdict}\n`;
          setSubmitted(false);
        }

        output += `Test Cases: ${testCasesPassed}/${testCasesTotal} passed\n`;
        output += `Execution Time: ${executionTime || 0}ms\n`;
        output += `Memory: ${memoryUsage || 0}KB\n`;

        setConsoleOutput(output);
        setTestResults(tcResults || []);
      } else {
        setConsoleOutput("Error: " + (data.error || "Failed to submit code"));
        setSubmitted(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
      setConsoleOutput("Network error: Failed to submit code");
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      {/* Header with Timer */}
      <div className="bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-blue-500 animate-pulse" />
          <h2 className="text-lg font-bold text-white">Practice Session</h2>
          <span className="text-gray-500 text-sm">Problem: {problem.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-lg font-mono font-bold text-orange-500">{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden gap-0">
        {/* Left Column - Problem Details */}
        <div className="w-1/4 border-r border-gray-800 overflow-y-auto p-6 space-y-6 bg-gray-950">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn(
                "px-3 py-1 rounded text-xs font-semibold",
                problem.difficulty === "Easy" && "bg-green-500/20 text-green-400",
                problem.difficulty === "Medium" && "bg-yellow-500/20 text-yellow-400",
                problem.difficulty === "Hard" && "bg-red-500/20 text-red-400"
              )}>
                {problem.difficulty}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{problem.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{problem.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-200 mb-3 uppercase tracking-wide">Examples</h4>
            <div className="space-y-2">
              {problem.examples.map((example, idx) => (
                <div key={idx} className="bg-gray-900 rounded p-3 border border-gray-800 text-xs">
                  <div className="mb-2">
                    <span className="text-gray-500">Input:</span>
                    <code className="text-cyan-400 ml-2 font-mono break-words">{example.input}</code>
                  </div>
                  <div>
                    <span className="text-gray-500">Output:</span>
                    <code className="text-green-400 ml-2 font-mono">{example.output}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-200 mb-2 uppercase tracking-wide">Constraints</h4>
            <p className="text-gray-400 text-xs leading-relaxed">{problem.constraints}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Language Selector with Compiler Info */}
          <div className="border-b border-gray-800 p-3 flex items-center gap-3 bg-gray-800/30">
            <Settings className="w-4 h-4 text-gray-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
            {compilerInfo?.compilers?.[selectedLanguage] && (
              <span className={cn(
                "text-xs px-2 py-1 rounded-full ml-2",
                compilerInfo.compilers[selectedLanguage].available
                  ? "bg-green-900/50 text-green-400 border border-green-700"
                  : "bg-red-900/50 text-red-400 border border-red-700"
              )}>
                {compilerInfo.compilers[selectedLanguage].version}
                {compilerInfo.useLocal && compilerInfo.compilers[selectedLanguage].available && " • Local"}
              </span>
            )}
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden border-b border-gray-800">
            <CodeEditor
              language={selectedLanguage}
              value={code}
              onChange={setCode}
            />
          </div>

          {/* Console Output */}
          <div className="bg-gray-800 p-3 max-h-32 overflow-y-auto border-b border-gray-700">
            <div className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
              {consoleOutput || "Run your code to see output..."}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-800 p-3 flex gap-2 bg-gray-800/30">
            <Button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold h-10"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </>
              )}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
              className={cn(
                "flex-1 text-white text-sm font-semibold h-10",
                submitted
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-violet-600 hover:bg-violet-700"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submit
                </>
              ) : submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accepted
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Practice() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedProblem, setSelectedProblem] = useState<typeof mockProblems[0] | null>(null);
  const [solvedProblems, setSolvedProblems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/api/practice/status');
        const data = await res.json();
        if (data.success && Array.isArray(data.solvedProblemIds)) {
          setSolvedProblems(new Set(data.solvedProblemIds));
        }
      } catch (e) {
        console.error("Failed to fetch practice status", e);
      }
    };
    fetchStatus();
  }, []);

  const topics = ["All", "Arrays", "Strings", "Hash Table", "Stack", "Dynamic Programming", "Binary Search"];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filteredProblems = mockProblems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === "All" || problem.topic === selectedTopic;
    const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  const handleProblemSolved = () => {
    if (selectedProblem) {
      setSolvedProblems(prev => new Set([...prev, selectedProblem.id]));
    }
  };

  const solveRate = Math.round((solvedProblems.size / mockProblems.length) * 100);
  const easyCount = solvedProblems.size > 0 ? Math.min(solvedProblems.size, 4) : 0;
  const mediumCount = Math.max(0, solvedProblems.size - 4);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto height-full w-full py-8 px-6">
        <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BookOpen className="w-10 h-10 text-blue-500" />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Practice Mode</h1>
                <p className="text-gray-400">Master your coding skills with 10 curated problems</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex gap-12">
                <div>
                  <div className="text-4xl font-bold text-blue-500">{solvedProblems.size}/{mockProblems.length}</div>
                  <p className="text-gray-400 text-sm mt-1">Solved</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-500">{solveRate}%</div>
                  <p className="text-gray-400 text-sm mt-1">Progress</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm"><span className="text-green-400 font-semibold">{easyCount}</span> Easy</p>
                  <p className="text-sm"><span className="text-yellow-400 font-semibold">{mediumCount}</span> Medium</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search problems by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-3 block">Filter by Topic</label>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      selectedTopic === topic
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300 mb-3 block">Filter by Difficulty</label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      selectedDifficulty === difficulty
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    )}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/70">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 w-12">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Problem</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Topic</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Difficulty</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Acceptance</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((problem) => (
                  <tr
                    key={problem.id}
                    onClick={() => setSelectedProblem(problem)}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      {solvedProblems.has(problem.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 animate-pulse" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-600 group-hover:text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {problem.id}. {problem.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{problem.topic}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold inline-block",
                        problem.difficulty === "Easy" && "bg-green-900/40 text-green-300",
                        problem.difficulty === "Medium" && "bg-yellow-900/40 text-yellow-300",
                        problem.difficulty === "Hard" && "bg-red-900/40 text-red-300"
                      )}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm font-mono">{problem.acceptance}</td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No problems found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      <Footer />

      {selectedProblem && (
        <LiveBattleInterface
          problem={selectedProblem}
          isOpen={!!selectedProblem}
          onClose={() => setSelectedProblem(null)}
          onSolved={handleProblemSolved}
        />
      )}
    </div>
  );
}
