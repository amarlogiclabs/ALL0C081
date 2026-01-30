import { useRef, useState } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export type Language = "javascript" | "typescript" | "python" | "cpp" | "java" | "go" | "rust";

interface LanguageConfig {
  id: Language;
  label: string;
  monacoLanguage: string;
  defaultCode: string;
}

export const languages: LanguageConfig[] = [
  {
    id: "javascript",
    label: "JavaScript",
    monacoLanguage: "javascript",
    defaultCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    
    return [];
}`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    monacoLanguage: "typescript",
    defaultCode: `function twoSum(nums: number[], target: number): number[] {
    // Write your solution here
    const map = new Map<number, number>();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        map.set(nums[i], i);
    }
    
    return [];
}`,
  },
  {
    id: "python",
    label: "Python",
    monacoLanguage: "python",
    defaultCode: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        seen = {}
        
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        
        return []`,
  },
  {
    id: "cpp",
    label: "C++",
    monacoLanguage: "cpp",
    defaultCode: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        unordered_map<int, int> seen;
        
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        
        return {};
    }
};`,
  },
  {
    id: "java",
    label: "Java",
    monacoLanguage: "java",
    defaultCode: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        Map<Integer, Integer> seen = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[] { seen.get(complement), i };
            }
            seen.put(nums[i], i);
        }
        
        return new int[] {};
    }
}`,
  },
  {
    id: "go",
    label: "Go",
    monacoLanguage: "go",
    defaultCode: `func twoSum(nums []int, target int) []int {
    // Write your solution here
    seen := make(map[int]int)
    
    for i, num := range nums {
        complement := target - num
        if j, ok := seen[complement]; ok {
            return []int{j, i}
        }
        seen[num] = i
    }
    
    return []int{}
}`,
  },
  {
    id: "rust",
    label: "Rust",
    monacoLanguage: "rust",
    defaultCode: `use std::collections::HashMap;

impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        // Write your solution here
        let mut seen: HashMap<i32, i32> = HashMap::new();
        
        for (i, &num) in nums.iter().enumerate() {
            let complement = target - num;
            if let Some(&j) = seen.get(&complement) {
                return vec![j, i as i32];
            }
            seen.insert(num, i as i32);
        }
        
        vec![]
    }
}`,
  },
];

interface CodeEditorProps {
  language: Language;
  value: string;
  onChange: (value: string) => void;
  onLanguageChange?: (language: Language) => void;
  readOnly?: boolean;
  className?: string;
  height?: string;
}

export function CodeEditor({
  language,
  value,
  onChange,
  onLanguageChange,
  readOnly = false,
  className,
  height = "100%",
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const languageConfig = languages.find((l) => l.id === language) || languages[0];

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsLoading(false);

    // Configure Monaco theme
    monaco.editor.defineTheme("cosmic-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6b7280", fontStyle: "italic" },
        { token: "keyword", foreground: "c084fc" },
        { token: "string", foreground: "22d3ee" },
        { token: "number", foreground: "fbbf24" },
        { token: "type", foreground: "f472b6" },
        { token: "function", foreground: "60a5fa" },
        { token: "variable", foreground: "e2e8f0" },
        { token: "operator", foreground: "94a3b8" },
      ],
      colors: {
        "editor.background": "#0f1219",
        "editor.foreground": "#e2e8f0",
        "editor.lineHighlightBackground": "#1e293b",
        "editor.selectionBackground": "#334155",
        "editor.inactiveSelectionBackground": "#1e293b",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#94a3b8",
        "editorCursor.foreground": "#c084fc",
        "editor.selectionHighlightBackground": "#334155",
        "editorIndentGuide.background": "#1e293b",
        "editorIndentGuide.activeBackground": "#334155",
        "editorBracketMatch.background": "#334155",
        "editorBracketMatch.border": "#c084fc",
        "scrollbar.shadow": "#00000000",
        "scrollbarSlider.background": "#334155",
        "scrollbarSlider.hoverBackground": "#475569",
        "scrollbarSlider.activeBackground": "#64748b",
      },
    });

    monaco.editor.setTheme("cosmic-dark");

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontLigatures: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      padding: { top: 16, bottom: 16 },
      lineNumbers: "on",
      renderLineHighlight: "line",
      bracketPairColorization: { enabled: true },
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: "on",
    });
  };

  const handleChange: OnChange = (value) => {
    onChange(value || "");
  };

  return (
    <div className={cn("relative w-full h-full bg-background rounded-lg overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading editor...</span>
          </div>
        </div>
      )}
      <Editor
        height={height}
        language={languageConfig.monacoLanguage}
        value={value}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        loading={null}
        options={{
          readOnly,
          domReadOnly: readOnly,
        }}
      />
    </div>
  );
}

export function getDefaultCode(language: Language): string {
  const config = languages.find((l) => l.id === language);
  return config?.defaultCode || "";
}
