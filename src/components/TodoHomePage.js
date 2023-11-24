// src/components/HomePage.js
import React, { useEffect, useState } from "react";
import { Button, Container, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import TodoModal from "./TodoModal";
import {
  deleteTodoAsync,
  changeActiveFilter,
  clearCompleted,
  getTodosAsync,
  reorderTodos,
} from "../features/todos/todoSlice";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const HomePage = () => {
  const dispatch = useDispatch();
  const todos = useSelector((state) => state.todos.items);
  const activeFilter = useSelector((state) => state.todos.activeFilter);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTodoId, setEditTodoId] = useState(null);

  const handleCreateModalClose = () => setShowCreateModal(false);
  const handleEditModalClose = () => setShowEditModal(false);

  const handleDeleteTodo = (id) => {
    dispatch(deleteTodoAsync(id));
  };

  useEffect(() => {
    dispatch(getTodosAsync());
  }, []);

  const handleEditClick = (id) => {
    setEditTodoId(id);
    setShowEditModal(true);
  };

  const handleFilterChange = (filter) => {
    dispatch(changeActiveFilter(filter));
  };

  const handleClearCompleted = () => {
    dispatch(clearCompleted());
  };

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Reorder the todos
    const reorderedTodos = Array.from(Object.values(todos));
    const [removed] = reorderedTodos.splice(sourceIndex, 1);
    reorderedTodos.splice(destinationIndex, 0, removed);

    // Dispatch the reorder action
    dispatch(reorderTodos(reorderedTodos));
  };

  return (
    <Container className="mt-5">
      <h1>To-Do List</h1>
      <Button
        variant="primary"
        className="mb-3"
        onClick={() => setShowCreateModal(true)}
      >
        Create Todo
      </Button>

      <div className="mb-3">
        <Button
          variant="outline-secondary"
          className={`mr-2 ${activeFilter === "all" && "active"}`}
          onClick={() => handleFilterChange("all")}
        >
          All
        </Button>{" "}
        <Button
          variant="outline-success"
          className={`mr-2 ${activeFilter === "active" && "active"}`}
          onClick={() => handleFilterChange("active")}
        >
          Active
        </Button>{" "}
        <Button
          variant="outline-danger"
          className={`mr-2 ${activeFilter === "completed" && "active"}`}
          onClick={() => handleFilterChange("completed")}
        >
          Completed
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Todo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody ref={provided.innerRef} {...provided.droppableProps}>
                {Object.values(todos).map((todo, index) => (
                  <Draggable
                    key={todo?.id}
                    draggableId={todo?.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <tr
                        key={todo.id}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <td>{todo?.id}</td>
                        <td>{todo?.title}</td>
                        <td>
                          <Button
                            variant="info"
                            onClick={() => handleEditClick(todo.id)}
                          >
                            Edit
                          </Button>{" "}
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteTodo(todo.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </Table>
          )}
        </Droppable>
      </DragDropContext>

      <TodoModal show={showCreateModal} handleClose={handleCreateModalClose} />

      <TodoModal
        show={showEditModal}
        handleClose={handleEditModalClose}
        editTodoId={editTodoId}
        initialText={(Array.isArray(todos) ? todos.find((todo) => todo.id === editTodoId) : todos[editTodoId])?.title}
      />
    </Container>
  );
};

export default HomePage;
