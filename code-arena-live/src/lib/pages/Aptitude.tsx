import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Calculator, 
  MessageSquare, 
  Puzzle, 
  Clock, 
  Trophy,
  ChevronRight,
  Play,
  CheckCircle2,
  BarChart3,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface TestCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  questions: number;
  duration: string;
  gradient: string;
  completed: number;
  total: number;
  testQuestions: Question[];
}

const testCategories: TestCategory[] = [
  {
    id: "quantitative",
    title: "Quantitative Aptitude",
    description: "Numbers, percentages, algebra, geometry, and data interpretation",
    icon: Calculator,
    questions: 30,
    duration: "45 min",
    gradient: "from-accent to-cyan-400",
    completed: 12,
    total: 25,
    testQuestions: [
      {
        id: 1,
        category: "quantitative",
        question: "What is 15% of 240?",
        options: ["36", "30", "40", "45"],
        correctAnswer: 0,
      },
      {
        id: 2,
        category: "quantitative",
        question: "If 3x + 7 = 22, what is x?",
        options: ["5", "7", "9", "11"],
        correctAnswer: 0,
      },
      {
        id: 3,
        category: "quantitative",
        question: "The ratio of boys to girls is 3:2. If there are 50 students total, how many boys?",
        options: ["20", "30", "35", "40"],
        correctAnswer: 1,
      },
      {
        id: 4,
        category: "quantitative",
        question: "What is the area of a circle with radius 7?",
        options: ["154", "145", "176", "198"],
        correctAnswer: 0,
      },
      {
        id: 5,
        category: "quantitative",
        question: "If a car travels 300 km in 5 hours, what is its average speed?",
        options: ["50 km/h", "60 km/h", "75 km/h", "100 km/h"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "logical",
    title: "Logical Reasoning",
    description: "Patterns, sequences, puzzles, and analytical thinking",
    icon: Puzzle,
    questions: 25,
    duration: "35 min",
    gradient: "from-tier-stellar to-purple-400",
    completed: 8,
    total: 20,
    testQuestions: [
      {
        id: 1,
        category: "logical",
        question: "Complete the series: 2, 4, 8, 16, ?",
        options: ["20", "24", "32", "36"],
        correctAnswer: 2,
      },
      {
        id: 2,
        category: "logical",
        question: "If all roses are flowers, and all flowers fade, then all roses...",
        options: ["bloom", "fade", "are red", "wilt"],
        correctAnswer: 1,
      },
      {
        id: 3,
        category: "logical",
        question: "Which option is the odd one out?",
        options: ["Cat", "Dog", "Tiger", "Keyboard"],
        correctAnswer: 3,
      },
      {
        id: 4,
        category: "logical",
        question: "If BOOK is coded as 2334, what is LOOK coded as?",
        options: ["3334", "3344", "4334", "4443"],
        correctAnswer: 0,
      },
      {
        id: 5,
        category: "logical",
        question: "Which shape comes next? Triangle, Square, Pentagon, ?",
        options: ["Hexagon", "Heptagon", "Octagon", "Circle"],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: "verbal",
    title: "Verbal Ability",
    description: "Reading comprehension, grammar, vocabulary, and sentence correction",
    icon: MessageSquare,
    questions: 25,
    duration: "30 min",
    gradient: "from-tier-luminary to-amber-400",
    completed: 15,
    total: 20,
    testQuestions: [
      {
        id: 1,
        category: "verbal",
        question: "Choose the synonym of 'Benevolent'",
        options: ["Cruel", "Kind", "Angry", "Sad"],
        correctAnswer: 1,
      },
      {
        id: 2,
        category: "verbal",
        question: "Which sentence is grammatically correct?",
        options: ["She go to school.", "She goes to school.", "She going to school.", "She gone to school."],
        correctAnswer: 1,
      },
      {
        id: 3,
        category: "verbal",
        question: "Choose the correct spelling:",
        options: ["Recieve", "Recieve", "Receive", "Receve"],
        correctAnswer: 2,
      },
      {
        id: 4,
        category: "verbal",
        question: "The opposite of 'Diligent' is:",
        options: ["Lazy", "Careful", "Active", "Smart"],
        correctAnswer: 0,
      },
      {
        id: 5,
        category: "verbal",
        question: "What does 'Ubiquitous' mean?",
        options: ["Unique", "Present everywhere", "Abundant", "Important"],
        correctAnswer: 1,
      },
    ],
  },
];

interface TestResult {
  categoryId: string;
  categoryTitle: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
}

function TestCard({ category, onStart }: { category: TestCategory; onStart: (id: string) => void }) {
  const Icon = category.icon;
  const progress = (category.completed / category.total) * 100;

  return (
    <div className="glass-card-hover p-6 rounded-2xl group cursor-pointer">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
            category.gradient
          )}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
            {category.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{category.description}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              <span>{category.testQuestions.length} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{category.duration}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Tests completed</span>
              <span className="font-mono">
                {category.completed}/{category.total}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full bg-gradient-to-r", category.gradient)}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button 
            onClick={() => onStart(category.id)}
            variant="outline" 
            size="sm" 
            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Test
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TestQuestions({ 
  category, 
  onComplete,
  onCancel 
}: { 
  category: TestCategory;
  onComplete: (result: TestResult) => void;
  onCancel: () => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(category.testQuestions.length).fill(-1));
  const [showReview, setShowReview] = useState(false);

  const questions = category.testQuestions;
  const question = questions[currentQuestion];

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const correctCount = selectedAnswers.filter(
      (answer, index) => answer === questions[index].correctAnswer
    ).length;

    const result: TestResult = {
      categoryId: category.id,
      categoryTitle: category.title,
      score: correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100),
      date: new Date().toLocaleDateString(),
    };

    onComplete(result);
  };

  if (showReview) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Review Your Answers</h2>
            <button onClick={() => setShowReview(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const isCorrect = selectedAnswers[idx] === q.correctAnswer;
              return (
                <div key={idx} className="border border-gray-800 rounded-lg p-4">
                  <p className="font-semibold mb-3">Q{idx + 1}: {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={cn(
                          "p-3 rounded border-2",
                          optIdx === q.correctAnswer
                            ? "border-green-500 bg-green-500/10"
                            : optIdx === selectedAnswers[idx] && !isCorrect
                            ? "border-red-500 bg-red-500/10"
                            : "border-gray-700"
                        )}
                      >
                        <span className="font-mono text-sm">{String.fromCharCode(65 + optIdx)}.</span> {option}
                        {optIdx === q.correctAnswer && <span className="ml-2 text-green-400">✓</span>}
                        {optIdx === selectedAnswers[idx] && !isCorrect && <span className="ml-2 text-red-400">✗</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mt-8">
            <Button onClick={() => setShowReview(false)} variant="outline">Back</Button>
            <Button onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Submit Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button 
              onClick={onCancel}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h2 className="text-2xl font-bold text-white">{category.title}</h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Question {currentQuestion + 1} of {questions.length}</p>
            <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-lg font-semibold mb-6">{question.question}</p>
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                className={cn(
                  "w-full p-4 rounded-lg border-2 text-left transition-all",
                  selectedAnswers[currentQuestion] === idx
                    ? "border-primary bg-primary/10"
                    : "border-gray-800 hover:border-gray-700"
                )}
              >
                <span className="font-mono font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Previous
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button 
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="flex-1 bg-primary"
            >
              Next
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => setShowReview(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Review Answers
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Aptitude() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      categoryId: "quantitative",
      categoryTitle: "Quantitative Aptitude",
      score: 15,
      total: 30,
      percentage: 50,
      date: "Jan 20, 2025",
    },
    {
      categoryId: "verbal",
      categoryTitle: "Verbal Ability",
      score: 22,
      total: 25,
      percentage: 88,
      date: "Jan 18, 2025",
    },
  ]);

  const currentCategory = testCategories.find((cat) => cat.id === selectedCategory);

  // Calculate overall readiness
  const totalCompleted = testCategories.reduce((acc, cat) => acc + cat.completed, 0);
  const totalTests = testCategories.reduce((acc, cat) => acc + cat.total, 0);
  const readinessScore = Math.round((totalCompleted / totalTests) * 100);

  const handleTestComplete = (result: TestResult) => {
    // Save to localStorage for profile to display
    const existingHistory = localStorage.getItem("aptitudeTestHistory");
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    localStorage.setItem("aptitudeTestHistory", JSON.stringify([result, ...history]));
    
    setTestResults([result, ...testResults]);
    setSelectedCategory(null);
  };

  if (currentCategory) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <TestQuestions 
          category={currentCategory}
          onComplete={handleTestComplete}
          onCancel={() => setSelectedCategory(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Brain className="w-4 h-4 text-tier-stellar" />
              <span className="text-sm">Placement Preparation</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Aptitude Tests</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Prepare for placements with comprehensive aptitude assessments. 
              Track your progress and identify areas for improvement.
            </p>
          </div>

          {/* Readiness Score */}
          <div className="glass-card p-8 rounded-2xl mb-12 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Score Circle */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-secondary"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${readinessScore * 3.52} 352`}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold">{readinessScore}%</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold mb-2">Placement Readiness</h2>
                <p className="text-muted-foreground mb-4">
                  Complete more tests to improve your readiness score
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>{totalCompleted} tests completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-accent" />
                    <span>{totalTests - totalCompleted} remaining</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block">
                <Trophy className="w-16 h-16 text-tier-luminary" />
              </div>
            </div>
          </div>

          {/* Recent Results */}
          {testResults.length > 0 && (
            <div className="glass-card p-8 rounded-2xl mb-12 max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold mb-6">Recent Test Results</h2>
              <div className="space-y-4">
                {testResults.slice(0, 3).map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-gray-800">
                    <div>
                      <p className="font-semibold">{result.categoryTitle}</p>
                      <p className="text-sm text-muted-foreground">{result.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{result.percentage}%</p>
                      <p className="text-sm text-muted-foreground">{result.score}/{result.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Categories */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold">Test Categories</h2>
            <div className="grid gap-6">
              {testCategories.map((category) => (
                <TestCard key={category.id} category={category} onStart={setSelectedCategory} />
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent" />
                Preparation Tips
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                      <span className="text-success font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Practice Daily</p>
                      <p className="text-sm text-muted-foreground">
                        Consistency beats intensity. Aim for 30 mins daily.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                      <span className="text-warning font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Time Management</p>
                      <p className="text-sm text-muted-foreground">
                        Don't spend too long on one question. Move on and return.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Review Mistakes</p>
                      <p className="text-sm text-muted-foreground">
                        Analyze wrong answers to understand your weak areas.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <span className="text-accent font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-medium">Simulate Real Tests</p>
                      <p className="text-sm text-muted-foreground">
                        Take full-length timed tests to build stamina.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
