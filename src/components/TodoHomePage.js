// src/components/HomePage.js
import React, { useEffect, useState } from 'react';
import { Button, Container, Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import TodoModal from './TodoModal';
import { deleteTodoAsync, changeActiveFilter, clearCompleted, getTodosAsync } from '../features/todos/todoSlice';

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
  }, [])
  

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

  const filteredTodos = () => {
    switch (activeFilter) {
      case 'all':
        return Object.values(todos);
      case 'completed':
        return Object.values(todos).filter((todo) => todo.completed);
      case 'active':
        return Object.values(todos).filter((todo) => !todo.completed);
      default:
        return Object.values(todos);
    }
  };

  return (
    <Container className="mt-5">
      <h1>To-Do List</h1>
      <Button variant="primary" className="mb-3" onClick={() => setShowCreateModal(true)}>
        Create Todo
      </Button>

      <div className="mb-3">
        <Button
          variant="outline-secondary"
          className={`mr-2 ${activeFilter === 'all' && 'active'}`}
          onClick={() => handleFilterChange('all')}
        >
          All
        </Button>
        {' '}
        <Button
          variant="outline-success"
          className={`mr-2 ${activeFilter === 'active' && 'active'}`}
          onClick={() => handleFilterChange('active')}
        >
          Active
        </Button>
        {' '}
        <Button
          variant="outline-danger"
          className={`mr-2 ${activeFilter === 'completed' && 'active'}`}
          onClick={() => handleFilterChange('completed')}
        >
          Completed
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Todo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTodos().map((todo) => (
            <tr key={todo?.id}>
              <td>{todo?.id}</td>
              <td>{todo?.title}</td>
              <td>
                <Button variant="info" onClick={() => handleEditClick(todo.id)}>
                  Edit
                </Button>{' '}
                <Button variant="danger" onClick={() => handleDeleteTodo(todo.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <TodoModal show={showCreateModal} handleClose={handleCreateModalClose} />

      <TodoModal
        show={showEditModal}
        handleClose={handleEditModalClose}
        editTodoId={editTodoId}
        initialText={todos[editTodoId]?.title}
      />
    </Container>
  );
};

export default HomePage;
