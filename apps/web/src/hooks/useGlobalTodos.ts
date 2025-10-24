/**
 * 🚀 GLOBAL TODO HOOK
 * React hook for accessing and managing global todos from anywhere in the app
 */
import { useState, useEffect, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;
export const useGlobalTodos = () => {
    const [todos, setTodos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        completionRate: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Fetch todos from API or local storage
    const fetchTodos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Try to fetch from API first
            try {
                const response = await fetch('/api/todos');
                if (response.ok) {
                    const data = await response.json();
                    setTodos(data.todos || []);
                    return;
                }
            }
            catch (apiError) {
                logger.info('API not available, using local storage');
            }
            // Fallback to local storage
            const storedTodos = localStorage.getItem('pawfectmatch-todos');
            if (storedTodos) {
                const parsedTodos = JSON.parse(storedTodos);
                setTodos(parsedTodos);
            }
            else {
                // Initialize with default todos
                const defaultTodos = getDefaultTodos();
                setTodos(defaultTodos);
                localStorage.setItem('pawfectmatch-todos', JSON.stringify(defaultTodos));
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch todos');
        }
        finally {
            setLoading(false);
        }
    }, []);
    // Save todos to API or local storage
    const saveTodos = useCallback(async (updatedTodos) => {
        try {
            // Try to save to API first
            try {
                const response = await fetch('/api/todos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ todos: updatedTodos }),
                });
                if (response.ok) {
                    return;
                }
            }
            catch (apiError) {
                logger.info('API not available, using local storage');
            }
            // Fallback to local storage
            localStorage.setItem('pawfectmatch-todos', JSON.stringify(updatedTodos));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save todos');
        }
    }, []);
    // Add new todo
    const addTodo = useCallback(async (description, category, priority = 'medium') => {
        const newTodo = {
            id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            description,
            category,
            priority,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const updatedTodos = [...todos, newTodo];
        setTodos(updatedTodos);
        await saveTodos(updatedTodos);
    }, [todos, saveTodos]);
    // Toggle todo completion
    const toggleTodo = useCallback(async (id) => {
        const updatedTodos = todos.map(todo => todo.id === id
            ? { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() }
            : todo);
        setTodos(updatedTodos);
        await saveTodos(updatedTodos);
    }, [todos, saveTodos]);
    // Update todo
    const updateTodo = useCallback(async (id, updates) => {
        const updatedTodos = todos.map(todo => todo.id === id
            ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
            : todo);
        setTodos(updatedTodos);
        await saveTodos(updatedTodos);
    }, [todos, saveTodos]);
    // Delete todo
    const deleteTodo = useCallback(async (id) => {
        const updatedTodos = todos.filter(todo => todo.id !== id);
        setTodos(updatedTodos);
        await saveTodos(updatedTodos);
    }, [todos, saveTodos]);
    // Search todos
    const searchTodos = useCallback((keyword) => {
        if (!keyword.trim())
            return todos;
        return todos.filter(todo => todo.description.toLowerCase().includes(keyword.toLowerCase()) ||
            todo.category.toLowerCase().includes(keyword.toLowerCase()));
    }, [todos]);
    // Filter todos by category
    const getTodosByCategory = useCallback((category) => {
        return todos.filter(todo => todo.category === category);
    }, [todos]);
    // Filter todos by priority
    const getTodosByPriority = useCallback((priority) => {
        return todos.filter(todo => todo.priority === priority);
    }, [todos]);
    // Get pending todos
    const getPendingTodos = useCallback(() => {
        return todos.filter(todo => !todo.completed);
    }, [todos]);
    // Get completed todos
    const getCompletedTodos = useCallback(() => {
        return todos.filter(todo => todo.completed);
    }, [todos]);
    // Calculate stats
    const calculateStats = useCallback(() => {
        const total = todos.length;
        const completed = todos.filter(todo => todo.completed).length;
        const pending = total - completed;
        const highPriority = todos.filter(todo => todo.priority === 'high' && !todo.completed).length;
        const mediumPriority = todos.filter(todo => todo.priority === 'medium' && !todo.completed).length;
        const lowPriority = todos.filter(todo => todo.priority === 'low' && !todo.completed).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
            total,
            completed,
            pending,
            highPriority,
            mediumPriority,
            lowPriority,
            completionRate,
        };
    }, [todos]);
    // Calculate categories
    const calculateCategories = useCallback(() => {
        const categoryMap = new Map();
        todos.forEach(todo => {
            if (!categoryMap.has(todo.category)) {
                categoryMap.set(todo.category, []);
            }
            categoryMap.get(todo.category).push(todo);
        });
        return Array.from(categoryMap.entries()).map(([name, tasks]) => {
            const completed = tasks.filter(task => task.completed).length;
            const total = tasks.length;
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
            return {
                name,
                tasks,
                completed,
                total,
                completionRate,
            };
        });
    }, [todos]);
    // Update stats and categories when todos change
    useEffect(() => {
        setStats(calculateStats());
        setCategories(calculateCategories());
    }, [todos, calculateStats, calculateCategories]);
    // Initial fetch
    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);
    return {
        // Data
        todos,
        categories,
        stats,
        loading,
        error,
        // Actions
        addTodo,
        toggleTodo,
        updateTodo,
        deleteTodo,
        searchTodos,
        getTodosByCategory,
        getTodosByPriority,
        getPendingTodos,
        getCompletedTodos,
        refreshTodos: fetchTodos,
        // Utilities
        hasHighPriorityTasks: stats.highPriority > 0,
        hasPendingTasks: stats.pending > 0,
        isAlmostComplete: stats.completionRate >= 90,
    };
};
// Default todos for initialization
const getDefaultTodos = () => {
    return [
        {
            id: 'todo-1',
            description: 'Complete UHD/4K graphics implementation',
            category: 'UI/UX TASKS',
            priority: 'high',
            completed: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'todo-2',
            description: 'Implement 60fps animations across all components',
            category: 'UI/UX TASKS',
            priority: 'high',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'todo-3',
            description: 'Complete WCAG 2.1 AA accessibility compliance',
            category: 'UI/UX TASKS',
            priority: 'high',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'todo-4',
            description: 'Set up comprehensive mobile device testing',
            category: 'TESTING & QUALITY ASSURANCE',
            priority: 'medium',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'todo-5',
            description: 'Implement production deployment pipeline',
            category: 'DEPLOYMENT & DEVOPS',
            priority: 'medium',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];
};
export default useGlobalTodos;
//# sourceMappingURL=useGlobalTodos.js.map