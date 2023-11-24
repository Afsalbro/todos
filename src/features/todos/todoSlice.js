// todosSlice.js
import { createSlice, createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import axios from "axios";

const api = "https://jsonplaceholder.typicode.com/todos";
const LOCAL_STORAGE_KEY = "todos";

const saveToLocalStorage = (todos) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
};

const loadFromLocalStorage = () => {
  const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
  return storedTodos ? JSON.parse(storedTodos) : [];
};

export const getTodosAsync = createAsyncThunk(
  "/todos/getTodosAsync",
  async () => {
    try {
      const res = await axios(api);
      console.log(res);
      return res.data;
    } catch (error) {
      throw Error("Error fetching todos");
    }
  }
);

export const toggleTodoAsync = createAsyncThunk(
  "/todos/toggleTodoAsync",
  async (id) => {
    try {
      await axios.patch(`${api}/${id}`);
      return id;
    } catch (error) {
      throw Error("Error toggling todo");
    }
  }
);

export const deleteTodoAsync = createAsyncThunk(
  "/todos/deleteTodoAsync",
  async (id) => {
    try {
      await axios.delete(`${api}/${id}`);
      return id;
    } catch (error) {
      throw Error("Error deleting todo");
    }
  }
);

export const addTodoAsync = createAsyncThunk(
  "/todos/addTodoAsync",
  async (data) => {
    try {
      const res = await axios.post(`${api}`, data);
      return res.data;
    } catch (error) {
      throw Error("Error adding todo");
    }
  }
);

export const editTodoAsync = createAsyncThunk(
  "/todos/editTodoAsync",
  async ({ id, data }) => {
    try {
      await axios.put(`${api}/${id}`, data);
      return { id, data };
    } catch (error) {
      throw Error("Error editing todo");
    }
  }
);

const todosSlice = createSlice({
  name: "todos",
  initialState: {
    items: loadFromLocalStorage(),
    allIds: Object.keys(loadFromLocalStorage()),
    activeFilter: "all",
    getStatus: "idle",
    addStatus: "idle",
    error: null,
  },
  reducers: {
    changeActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
    clearCompleted: (state, action) => {
      state.items = state.items.filter((item) => !item.completed);
      state.allIds = state.items.map((todo) => todo.id);
    },
    reorderTodos: (state, action) => {
        state.items = action.payload;
        saveToLocalStorage(state.items);
      },
  },
  extraReducers(builder) {
    builder
      .addCase(getTodosAsync.pending, (state) => {
        state.getStatus = "pending";
      })
      .addCase(getTodosAsync.fulfilled, (state, action) => {
        const todos = action.payload.reduce((acc, todo) => {
          acc[todo.id] = todo;
          return acc;
        }, {});
        state.items = todos;
        state.allIds = Object.keys(todos);
        state.getStatus = "succeeded";
      })
      .addCase(getTodosAsync.rejected, (state) => {
        state.getStatus = "failed";
        state.error = "Error fetching todos";
      })
      .addCase(addTodoAsync.pending, (state) => {
        state.addStatus = "pending";
      })
      .addCase(addTodoAsync.fulfilled, (state, action) => {
        const { id, title } = action.payload;
        state.items[id] = { id, title, completed: false };
        state.allIds.push(id);
        state.addStatus = "succeeded";
        saveToLocalStorage(state.items);
      })
      .addCase(addTodoAsync.rejected, (state) => {
        state.addStatus = "failed";
        state.error = "Error adding todo";
      })
      .addCase(editTodoAsync.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        state.items[id] = { ...state.items[id], ...data };
        saveToLocalStorage(state.items);
      })
      .addCase(editTodoAsync.rejected, (state) => {
        state.addStatus = "failed";
        state.error = "Error editing todo";
      })
      .addCase(toggleTodoAsync.fulfilled, (state, action) => {
        const id = action.payload;
        state.items[id].completed = !state.items[id].completed;
        saveToLocalStorage(state.items);
      })
      .addCase(deleteTodoAsync.fulfilled, (state, action) => {
        const id = action.payload;
        delete state.items[id];
        state.allIds = state.allIds.filter((itemId) => itemId !== id);
        saveToLocalStorage(state.items);
      });
  },
});

export default todosSlice.reducer;

export const { changeActiveFilter, clearCompleted, reorderTodos } =
  todosSlice.actions;

export const selectTodos = (state) => Object.values(state.todos.items);

export const selectTodoById = (state, todoId) => state.todos.items[todoId];

export const selectTodosByFilter = (state) => {
  const { activeFilter, items, allIds } = state.todos;
  const filteredIds =
    activeFilter === "all"
      ? allIds
      : activeFilter === "completed"
      ? allIds.filter((id) => items[id].completed)
      : allIds.filter((id) => !items[id].completed);

  return filteredIds.map((id) => items[id]);
};

export const selectTodosStatus = (state) => state.todos.getStatus;
export const selectAddTodoStatus = (state) => state.todos.addStatus;
export const selectTodosError = (state) => state.todos.error;
