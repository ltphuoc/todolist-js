function createTodoElement(todo) {
  if (!todo) return null;

  // find template
  const todoTemplate = document.getElementById('todoTemplate');
  if (!todoTemplate) return null;

  // clone liElement
  const todoElement = todoTemplate.content.firstElementChild.cloneNode(true);
  todoElement.dataset.id = todo.id;
  todoElement.dataset.status = todo.status;

  // render todo status
  const divElement = todoElement.querySelector('div.todo');
  if (!divElement) return null;
  const finishButton = todoElement.querySelector('button.mark-as-done');

  const alertClass = todo.status === 'completed' ? 'alert-success' : 'alert-secondary';
  divElement.classList.remove('alert-secondary');
  divElement.classList.add(alertClass);
  const button = todo.status === 'pending' ? 'btn-success' : 'btn-dark';
  finishButton.classList.remove('btn-success');
  finishButton.classList.add(button);
  const TextMessage = todo.status === 'pending' ? 'Finish' : 'Reset';
  finishButton.textContent = '';
  finishButton.textContent = TextMessage;
  //update content
  const titleElement = todoElement.querySelector('.todo__title');
  if (titleElement) titleElement.textContent = todo.title;

  // TODO: attach events for buttons
  // add click event for mark as done button

  if (finishButton) {
    finishButton.addEventListener('click', () => {
      const currentStatus = todoElement.dataset.status;
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      const newAlertClass = currentStatus === 'pending' ? 'alert-success' : 'alert-secondary';
      const newButton = currentStatus === 'pending' ? 'btn-dark' : 'btn-success';
      const newTextMessage = currentStatus === 'pending' ? 'Reset' : 'Finish';

      // update in localStorage
      const todoList = getTodoList();
      const index = todoList.findIndex((x) => x.id === todo.id);
      if (index >= 0) {
        todoList[index].status = newStatus;
        localStorage.setItem('todo_list', JSON.stringify(todoList));
      }

      // update status
      todoElement.dataset.status = newStatus;
      divElement.classList.remove('alert-secondary', 'alert-success');
      divElement.classList.add(newAlertClass);
      // update button
      finishButton.classList.remove('btn-dark', 'btn-success');
      finishButton.classList.add(newButton);
      finishButton.textContent = '';
      finishButton.textContent = newTextMessage;
    });
  }

  // add click event for remove button
  const removeButton = todoElement.querySelector('button.remove');
  if (removeButton) {
    removeButton.addEventListener('click', () => {
      // remove to localStorage
      const todoList = getTodoList();
      const newTodoList = todoList.filter((x) => x.id !== todo.id);
      localStorage.setItem('todo_list', JSON.stringify(newTodoList));

      // remove to DOM
      todoElement.remove();
    });
  }

  // add click event for edit button
  const editButton = todoElement.querySelector('button.edit');
  if (editButton) {
    editButton.addEventListener('click', () => {
      // lasted todo data
      const todoList = getTodoList();
      const lastedTodo = todoList.find((x) => x.id === todo.id);
      if (!lastedTodo) return;
      // find todo
      // populate data to todoForm
      populateTodoForm(lastedTodo);
    });
  }

  return todoElement;
}

function populateTodoForm(todo) {
  // query todoForm
  // dataset.id = todo.id
  const todoForm = document.getElementById('todoFormId');
  if (!todoForm) return;

  todoForm.dataset.id = todo.id;

  // set value for form controls
  // set todoText
  const todoInput = document.getElementById('todoText');
  if (todoInput) todoInput.value = todo.title;
}

function renderTodoList(todoList, ulElementId) {
  if (!Array.isArray(todoList) || todoList.length === 0) return;

  const ulElement = document.getElementById(ulElementId);

  if (!ulElement) return;

  for (const todo of todoList) {
    const liElement = createTodoElement(todo);
    ulElement.appendChild(liElement);
  }
}

function getTodoList() {
  try {
    return JSON.parse(localStorage.getItem('todo_list')) || [];
  } catch {
    return [];
  }
}

function handleTodoFormSubmit(event) {
  event.preventDefault();

  const todoForm = document.getElementById('todoFormId');
  if (!todoForm) return;
  const todoInput = document.getElementById('todoText');
  if (!todoInput) return;

  // determine add or edit
  const isEdit = Boolean(todoForm.dataset.id);
  if (isEdit) {
    // find current todo
    const todoList = getTodoList();
    const index = todoList.findIndex((x) => x.id.toString() === todoForm.dataset.id);
    if (index < 0) return;

    // update content and status
    todoList[index].title = todoInput.value;

    // save
    localStorage.setItem('todo_list', JSON.stringify(todoList));

    // apply DOM
    const liElement = document.querySelector(`ul#todoList > li[data-id="${todoForm.dataset.id}"]`);
    if (liElement) {
      // liElement.textContent = todoInput.value;
      const titleElement = liElement.querySelector('.todo__title');
      if (titleElement) titleElement.textContent = todoInput.value;

      // update status
    }
  } else {
    const newTodo = {
      id: Date.now(),
      title: todoInput.value,
      status: 'pending',
    };

    const todoList = getTodoList();
    todoList.push(newTodo);
    localStorage.setItem('todo_list', JSON.stringify(todoList));

    // apply DOM
    const newLiElement = createTodoElement(newTodo);
    const ulElement = document.getElementById('todoList');
    ulElement.appendChild(newLiElement);
  }

  // reset form
  delete todoForm.dataset.id;
  todoForm.reset();
}
// main()
(() => {
  // const todoList = [
  //   { id: 1, title: 'Learn HTML', status: 'completed' },
  //   { id: 2, title: 'Learn CSS', status: 'completed' },
  //   { id: 3, title: 'Learn JS', status: 'completed' },
  //   { id: 4, title: 'Learn REACT JS', status: 'pending' },
  //   { id: 5, title: 'Learn TYPESCRIPT', status: 'pending' },
  //   { id: 6, title: 'Learn NEXT JS', status: 'pending' },
  // ];
  // localStorage.setItem('todo_list',JSON.stringify(todoList));
  const todoList = getTodoList();
  renderTodoList(todoList, 'todoList');

  // register submit event for todo todoForm
  const todoForm = document.getElementById('todoFormId');
  if (todoForm) {
    todoForm.addEventListener('submit', handleTodoFormSubmit);
  }
})();
