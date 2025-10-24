/**
 * 🚀 GLOBAL TODO HOOK
 * React hook for accessing and managing global todos from anywhere in the app
 */
export interface TodoItem {
    id: string;
    description: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface TodoCategory {
    name: string;
    tasks: TodoItem[];
    completed: number;
    total: number;
    completionRate: number;
}
export interface TodoStats {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    completionRate: number;
}
export declare const useGlobalTodos: () => {
    todos: TodoItem[];
    categories: TodoCategory[];
    stats: TodoStats;
    loading: boolean;
    error: string | null;
    addTodo: (description: string, category: string, priority?: "high" | "medium" | "low") => Promise<void>;
    toggleTodo: (id: string) => Promise<void>;
    updateTodo: (id: string, updates: Partial<TodoItem>) => Promise<void>;
    deleteTodo: (id: string) => Promise<void>;
    searchTodos: (keyword: string) => TodoItem[];
    getTodosByCategory: (category: string) => TodoItem[];
    getTodosByPriority: (priority: "high" | "medium" | "low") => TodoItem[];
    getPendingTodos: () => TodoItem[];
    getCompletedTodos: () => TodoItem[];
    refreshTodos: () => Promise<void>;
    hasHighPriorityTasks: boolean;
    hasPendingTasks: boolean;
    isAlmostComplete: boolean;
};
export default useGlobalTodos;
//# sourceMappingURL=useGlobalTodos.d.ts.map