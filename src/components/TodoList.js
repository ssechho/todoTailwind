import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import TodoItem from "@/components/TodoItem";
import styles from "@/styles/TodoList.module.css";
import { db } from "@/firebase";
import {
  collection,
  query,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
} from "firebase/firestore";

const todoCollection = collection(db, "todos");

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const router = useRouter();
  const { data } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login");
    },
  });

  useEffect(() => {
    getTodos();
  }, [data]);

  const getTodos = async () => {
    if (!data?.user?.name) return;
    const q = query(todoCollection, where("userName", "==", data?.user?.name));
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
      userName: data?.user?.name,
      text: input,
      completed: false,
    });
    setTodos([...todos, { id: docRef.id, text: input, completed: false }]);
    setInput("");
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          const todoDoc = doc(todoCollection, id);
          updateDoc(todoDoc, { completed: !todo.completed });
          return { ...todo, completed: !todo.completed };
        } else {
          return todo;
        }
      })
    );
  };

  const deleteTodo = (id) => {
    const todoDoc = doc(todoCollection, id);
    deleteDoc(todoDoc);
    setTodos(
      todos.filter((todo) => {
        return todo.id !== id;
      })
    );
  };

  const editTodo = (id, newText) => {
    const todoDoc = doc(todoCollection, id);
    updateDoc(todoDoc, { text: newText });
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, text: newText };
        } else {
          return todo;
        }
      })
    );
  };

  return (
    <div className={styles.container}>
      <h1 className="text-xl mb-4 font-bold underline underline-offset-4 decoration-wavy">
        {data?.user?.name}'s Todo List
      </h1>
      <input
        type="text"
        className="w-full p-1 mb-4 border border-gray-300 rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="w-40 justify-self-end p-1 mb-4 bg-blue-500 text-white
                   border border-blue-500 rounded hover:bg-white hover:text-blue-500"
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
            onEdit={(newText) => editTodo(todo.id, newText)}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;

