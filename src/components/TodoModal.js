// src/components/TodoModal.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { addTodoAsync, editTodoAsync } from "../features/todos/todoSlice";

const TodoModal = ({ show, handleClose, editTodoId, initialText }) => {
  const dispatch = useDispatch();
  const [newTodoText, setNewTodoText] = useState("");

  useEffect(() => {
    setNewTodoText(initialText || "");
  }, [show, initialText]);

  const handleSave = () => {
    if (editTodoId) {
      dispatch(editTodoAsync({ id: editTodoId, data: { title: newTodoText } }));
    } else {
      dispatch(addTodoAsync({ userId: 1, title: newTodoText }));
    }

    setNewTodoText("");
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editTodoId ? "Edit Todo" : "Create Todo"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formTodoText">
            <Form.Label>Todo Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your todo"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {editTodoId ? "Save Changes" : "Create Todo"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TodoModal;
