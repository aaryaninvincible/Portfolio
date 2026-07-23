import React, { useState } from 'react';
import { BookOpen, Copy, Check, Terminal, Search, CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

interface DsaTopic {
  id: string;
  category: 'Python Core' | 'Data Structures' | 'Algorithms & LeetCode';
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  w3Reference?: string;
  codeSnippet: string;
  explanation: string[];
}

export const PythonDsaPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const topics: DsaTopic[] = [
    {
      id: 'py-string-slicing',
      category: 'Python Core',
      title: 'Python String Slicing & Indexing',
      difficulty: 'Beginner',
      timeComplexity: 'O(k)',
      spaceComplexity: 'O(k)',
      description: 'Master string slicing syntax string[start:end:step], negative indexing, reversing strings, and substring extraction.',
      w3Reference: 'https://www.w3schools.com/python/python_strings_slicing.asp',
      codeSnippet: `# Python String Slicing Syntax: string[start:end:step]

text = "Hello, World!"

# 1. Slicing from index 2 to 5 (exclusive)
print(text[2:5])        # Output: "llo"

# 2. Slice from the start to index 5
print(text[:5])         # Output: "Hello"

# 3. Slice from index 7 to the end
print(text[7:])         # Output: "World!"

# 4. Negative Indexing (Slice from end)
print(text[-6:-1])      # Output: "World"

# 5. Step Slicing (every 2nd character)
print(text[::2])        # Output: "Hlo Wrd"

# 6. Reversing a string instantly
reversed_text = text[::-1]
print(reversed_text)    # Output: "!dlroW ,olleH"`,
      explanation: [
        'start: Starting index (inclusive, default 0)',
        'end: Ending index (exclusive, default length of string)',
        'step: Stride size. Negative step reverses the direction of traversal.',
        'Slicing creates a new substring without mutating the original string.'
      ]
    },
    {
      id: 'py-list-comprehension',
      category: 'Python Core',
      title: 'List Comprehensions & Lambda Functions',
      difficulty: 'Beginner',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      description: 'Write concise, high-performance Pythonic code using list comprehensions and inline lambda functions.',
      codeSnippet: `# Standard List Comprehension
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squares_of_evens = [x**2 for x in numbers if x % 2 == 0]
print(squares_of_evens)  # Output: [4, 16, 36, 64, 100]

# Dictionary Comprehension
words = ["apple", "banana", "cherry"]
word_lengths = {word: len(word) for word in words}
print(word_lengths)      # Output: {'apple': 5, 'banana': 6, 'cherry': 6}

# Lambda & Map/Filter
multiply = lambda a, b: a * b
print(multiply(4, 5))    # Output: 20`,
      explanation: [
        'List comprehensions are faster than traditional for loops in Python.',
        'Syntax: [expression for item in iterable if condition]',
        'Lambda functions create small anonymous functions inline.'
      ]
    },
    {
      id: 'dsa-two-pointers',
      category: 'Algorithms & LeetCode',
      title: 'Two Pointers Technique (Two Sum II)',
      difficulty: 'Intermediate',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      description: 'Efficiently find two numbers in a sorted array that sum to a target value using left and right pointers.',
      codeSnippet: `def two_sum_sorted(numbers: list[int], target: int) -> list[int]:
    """
    Given 1-indexed sorted array, find indices of two numbers that sum to target.
    Time: O(N), Space: O(1)
    """
    left, right = 0, len(numbers) - 1
    
    while left < right:
        current_sum = numbers[left] + numbers[right]
        if current_sum == target:
            return [left + 1, right + 1]  # 1-based index
        elif current_sum < target:
            left += 1   # Increase sum by moving left pointer right
        else:
            right -= 1  # Decrease sum by moving right pointer left
            
    return []

# Test Case
print(two_sum_sorted([2, 7, 11, 15], 9))  # Output: [1, 2]`,
      explanation: [
        'Start left pointer at index 0 and right pointer at len - 1.',
        'If current_sum < target, increment left pointer.',
        'If current_sum > target, decrement right pointer.',
        'Avoids O(N^2) nested loops by reducing search space in O(N) time.'
      ]
    },
    {
      id: 'dsa-sliding-window',
      category: 'Algorithms & LeetCode',
      title: 'Sliding Window (Max Subarray Sum K)',
      difficulty: 'Intermediate',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      description: 'Maintain a fixed or dynamic window size over an array to compute max subarray sum in O(N) linear time.',
      codeSnippet: `def max_sub_array_of_size_k(arr: list[int], k: int) -> int:
    """
    Find maximum sum of any contiguous subarray of size k.
    Time: O(N), Space: O(1)
    """
    if len(arr) < k:
        return 0
        
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    for i in range(k, len(arr)):
        # Slide window right: add new element, remove old element
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
        
    return max_sum

# Test Case
print(max_sub_array_of_size_k([2, 1, 5, 1, 3, 2], 3))  # Output: 9 (5+1+3)`,
      explanation: [
        'Compute initial sum of first k elements.',
        'Slide window by adding incoming element arr[i] and subtracting outgoing element arr[i-k].',
        'Reduces repeated summation from O(N*k) to O(N).'
      ]
    },
    {
      id: 'dsa-linked-list-reverse',
      category: 'Data Structures',
      title: 'Reverse Singly Linked List',
      difficulty: 'Intermediate',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      description: 'Reverse a singly linked list in-place by updating pointer references.',
      codeSnippet: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_linked_list(head: ListNode) -> ListNode:
    """
    Reverses linked list in-place.
    Time: O(N), Space: O(1)
    """
    prev = None
    curr = head
    
    while curr:
        next_node = curr.next  # Save next node
        curr.next = prev       # Reverse pointer
        prev = curr            # Advance prev
        curr = next_node       # Advance curr
        
    return prev  # New head of reversed list`,
      explanation: [
        'Maintain three pointers: prev, curr, and next_node.',
        'Iteratively reverse curr.next to point to prev.',
        'Returns prev as the new head node.'
      ]
    },
    {
      id: 'dsa-binary-tree-inorder',
      category: 'Data Structures',
      title: 'Binary Tree Traversal (DFS & BFS)',
      difficulty: 'Advanced',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(H)',
      description: 'Implement Inorder DFS recursion and Queue-based Level Order BFS traversal for Binary Trees.',
      codeSnippet: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Inorder DFS (Left -> Node -> Right)
def inorder_traversal(root: TreeNode) -> list[int]:
    result = []
    def dfs(node):
        if not node: return
        dfs(node.left)
        result.append(node.val)
        dfs(node.right)
    dfs(root)
    return result

# Level Order BFS using Queue
def level_order(root: TreeNode) -> list[list[int]]:
    if not root: return []
    result, queue = [], deque([root])
    while queue:
        level_size = len(queue)
        current_level = []
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(current_level)
    return result`,
      explanation: [
        'Inorder DFS produces sorted order for Binary Search Trees (BST).',
        'BFS uses a Queue (deque) to visit tree nodes level by level.',
        'Used extensively in graph traversals and shortest path algorithms.'
      ]
    }
  ];

  const categories = ['All', 'Python Core', 'Data Structures', 'Algorithms & LeetCode'];

  const filteredTopics = topics.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen px-4 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="section-kicker flex items-center justify-center gap-2">
          <Terminal size={14} className="text-primary" /> Learning Hub
        </span>
        <h1 className="text-3xl md:text-5xl font-orbitron font-black text-light">
          Python <span className="text-gradient">&amp; DSA</span> Mastery
        </h1>
        <p className="text-slate-300 font-mono text-sm md:text-base leading-relaxed">
          Curated Python tutorials, String Slicing guides (W3Schools inspired), Data Structures, and LeetCode problem solutions with explanations.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-white/10">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-black shadow-[0_0_12px_rgba(255,115,0,0.4)]'
                  : 'glass text-slate-300 hover:text-white border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics (e.g. slicing, two pointers)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-4 py-2 font-mono text-xs text-light placeholder-slate-500 outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {filteredTopics.map((topic) => (
          <GlassCard key={topic.id} className="p-6 space-y-4 flex flex-col justify-between" disableTilt>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-secondary font-bold">
                  {topic.category}
                </span>
                <div className="flex gap-2 font-mono text-[10px]">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                    Time: {topic.timeComplexity}
                  </span>
                  <span className="bg-accent/10 text-accent px-2 py-0.5 rounded border border-accent/20">
                    Space: {topic.spaceComplexity}
                  </span>
                </div>
              </div>

              <h3 className="font-orbitron font-bold text-xl text-light">{topic.title}</h3>
              <p className="font-mono text-xs text-slate-300 leading-relaxed">{topic.description}</p>

              {topic.w3Reference && (
                <a
                  href={topic.w3Reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-primary underline hover:text-accent transition-colors"
                >
                  <BookOpen size={13} /> W3Schools String Slicing Reference <ArrowRight size={12} />
                </a>
              )}

              {/* Code Snippet Box */}
              <div className="relative group bg-black/90 rounded-xl p-4 border border-white/10 font-mono text-xs overflow-x-auto text-slate-200">
                <button
                  onClick={() => handleCopyCode(topic.id, topic.codeSnippet)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg glass text-slate-400 hover:text-white hover:border-primary/40 transition-all opacity-80 group-hover:opacity-100"
                  title="Copy Code"
                >
                  {copiedId === topic.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
                <pre className="text-emerald-400 font-mono text-[11px] leading-relaxed">
                  <code>{topic.codeSnippet}</code>
                </pre>
              </div>

              {/* Key Logic Breakdown */}
              <div className="space-y-1.5 pt-2">
                <h4 className="font-orbitron text-xs font-bold text-slate-300 uppercase tracking-wider">Key Takeaways &amp; Logic:</h4>
                <ul className="space-y-1 font-mono text-xs text-slate-400">
                  {topic.explanation.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
