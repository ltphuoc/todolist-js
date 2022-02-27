function createTodoElement(todo, param) {
  if (!todo) return null;

  // find template
  const todoTemplate = document.getElementById('todoTemplate');
  if (!todoTemplate) return null;

  // clone liElement
  const todoElement = todoTemplate.content.firstElementChild.cloneNode(true);
  todoElement.dataset.id = todo.id;
  todoElement.dataset.status = todo.status;

  const liTitleElement = todoElement.querySelector('.todo__title');
  if (!liTitleElement) return;
  liTitleElement.textContent = todo.title;

  // check if we should show or not
  todoElement.hidden = !isMatch(todoElement, param);

  // render todo status
  const divElement = todoElement.querySelector('.todo');
  const finishButton = todoElement.querySelector('button.mark-as-done');
  if (divElement) {
    const alertClass =
      todoElement.dataset.status === 'completed' ? 'alert-success' : 'alert-secondary';
    divElement.classList.remove('alert-secondary');
    divElement.classList.add(alertClass);

    //update button's content
    const buttonContent = todoElement.dataset.status === 'completed' ? 'Reset' : 'Finish';
    finishButton.textContent = buttonContent;

    // update button's background color
    const buttonBg = todoElement.dataset.status === 'pending' ? 'btn-success' : 'btn-dark';
    finishButton.classList.remove('btn-success');
    finishButton.classList.add(buttonBg);
  }

  finishButton.addEventListener('click', () => {
    const currentStatus = todoElement.dataset.status;
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    todoElement.dataset.status = newStatus;

    // update in localStorage
    const todoList = getTodoList();
    const index = todoList.findIndex((x) => x.id === todo.id);
    if (index >= 0) {
      todoList[index].status = newStatus;
      localStorage.setItem('todo_list', JSON.stringify(todoList));
    }

    const newAlertClass = currentStatus === 'pending' ? 'alert-success' : 'alert-secondary';

    // add class
    divElement.classList.remove('alert-secondary', 'alert-success');
    divElement.classList.add(newAlertClass);

    // update button's content
    const buttonContent = currentStatus === 'pending' ? 'Reset' : 'Finish';
    finishButton.textContent = buttonContent;

    // update button's background
    const buttonBg = currentStatus === 'completed' ? 'btn-success' : 'btn-dark';
    finishButton.classList.remove('btn-success', 'btn-dark');
    finishButton.classList.add(buttonBg);
  });

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

function renderTodoList(todoList, ulElementId, param) {
  if (!Array.isArray(todoList) || todoList.length === 0) return;

  const ulElement = document.getElementById(ulElementId);

  if (!ulElement) return;

  for (const todo of todoList) {
    const liElement = createTodoElement(todo, param);
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

  const inputCheckbox = todoForm.querySelector('input[type=checkbox]');
  const currentStatus = inputCheckbox.checked ? 'completed' : 'pending';
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
      const alertClass = currentStatus === 'completed' ? 'alert-success' : 'alert-secondary';
      const buttonBackground = currentStatus === 'completed' ? 'btn-success' : 'btn-dark';
      const buttonText = currentStatus === 'completed' ? 'Reset' : 'Finish';

      const divElement = liElement.querySelector('.todo');
      if (!divElement) return;
      const markAsDoneButton = liElement.querySelector('.mark-as-done');

      divElement.classList.remove('alert-secondary', 'alert-success');
      divElement.classList.add(alertClass);

      markAsDoneButton.classList.remove('btn-success', 'btn-dark');
      markAsDoneButton.classList.add(buttonBackground);
      markAsDoneButton.textContent = buttonText;
    }
  } else {
    const newTodo = {
      id: Date.now(),
      title: todoInput.value,
      status: inputCheckbox.checked ? 'completed' : 'pending',
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

function getAllTodoElements() {
  return document.querySelectorAll('#todoList > li');
}

function isMatchSearch(liElement, searchTerm) {
  if (!liElement) return false;
  if (searchTerm === '') return true;

  const titleElement = liElement.querySelector('p.todo__title');
  if (!titleElement) return false;

  return titleElement.textContent.toLowerCase().includes(searchTerm.toLowerCase());
}
function isMatchStatus(liElement, filterStatus) {
  return filterStatus === 'all' || liElement.dataset.status === filterStatus;
}
function isMatch(liElement, params) {
  return (
    isMatchSearch(liElement, params.get('searchTerm')) &&
    isMatchStatus(liElement, params.get('status'))
  );
}

// function searchTodo(searchTerm) {
//   // searchTerm === empty
//   const todoElementList = getAllTodoElements();

//   for (const liElement of todoElementList) {
//     const needToShow = isMatch(liElement, searchTerm);
//     liElement.hidden = !needToShow;
//   }
// }

function initSearchInput(param) {
  // find search term input
  const searchInput = document.getElementById('searchTerm');
  if (!searchInput) return;

  if (param.get('searchTerm')) {
    searchInput.value = param.get('searchTerm');
  }
  // attach change search
  searchInput.addEventListener('input', () => {
    // searchTodo(searchInput.value);
    handleFilterChange('searchTerm', searchInput.value);
  });
}

// function filterTodo(filterStatus) {
//   const todoElementList = getAllTodoElements();

//   for (const liElement of todoElementList) {
//     const needToShow = filterStatus === 'all' || liElement.dataset.status === filterStatus;
//     liElement.hidden = !needToShow;
//   }
// }

function initFilterStatus(param) {
  const filterStatusSelect = document.getElementById('filterStatus');
  if (!filterStatusSelect) return;

  if (param.get('status')) {
    filterStatusSelect.value = param.get('status');
  }
  filterStatusSelect.addEventListener('change', () => {
    // filterTodo(filterStatusSelect.value);
    handleFilterChange('status', filterStatusSelect.value);
  });
}

function handleFilterChange(filterName, filterValue) {
  // update query param
  const url = new URL(window.location);
  url.searchParams.set(filterName, filterValue);
  history.pushState({}, '', url);

  const todoElementList = getAllTodoElements();

  for (const liElement of todoElementList) {
    const needToShow = isMatch(liElement, url.searchParams);
    liElement.hidden = !needToShow;
  }
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
  const param = new URLSearchParams(window.location.search);
  const todoList = getTodoList();
  renderTodoList(todoList, 'todoList', param);

  // register submit event for todo todoForm
  const todoForm = document.getElementById('todoFormId');
  if (todoForm) {
    todoForm.addEventListener('submit', handleTodoFormSubmit);
  }

  // search

  initSearchInput(param);
  initFilterStatus(param);
})();
