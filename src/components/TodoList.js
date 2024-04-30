"use client";

import React, { useState, useEffect } from "react";
import TodoItem from "@/components/TodoItem";
import styles from "@/styles/TodoList.module.css";
import { db } from "@/firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const todoCollection = collection(db, "todos");

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    getTodos();
  }, []);

  const getTodos = async () => {
    const q = query(todoCollection);
    const results = await getDocs(q);
    const newTodos = [];

    results.docs.forEach((doc) => {
      newTodos.push({ id: doc.id, ...doc.data() });
    });

    setTodos(newTodos);
  };

  const addTodo = async () => {
    if (input.trim() === "") return;

    const docRef = await addDoc(todoCollection, {
      text: input,
      completed: false,
    });

    setTodos([...todos, { id: docRef.id, text: input, completed: false }]);
    setInput("");
  };

  const toggleTodo = async (id) => {
    const todoDoc = doc(todoCollection, id);
    const todo = todos.find((todo) => todo.id === id);

    await updateDoc(todoDoc, { completed: !todo.completed });

    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = async (id) => {
    const todoDoc = doc(todoCollection, id);
    await deleteDoc(todoDoc);

    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className={styles.container}>
      <h1 className="mb-4 mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Todo List
      </h1>
      <input
        type="text"
        className="mb-4 block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="mb-4 align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-gray-900 text-white shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none"
        onClick={addTodo}
      >
        Add Todo
      </button>
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
            className="mb-4"
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
