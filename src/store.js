import { configureStore } from "@reduxjs/toolkit"
import todosSlice from "./features/todos/todoSlice"

export const store = configureStore({
    reducer: {
        todos: todosSlice
    }
})