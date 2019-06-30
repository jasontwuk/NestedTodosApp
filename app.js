const todosInput = $("#todos_input");

// get the latest data from localStorage
let todos = store("storage_todos");


// *** taken from todoMVC ********************************************************************* //
function store(namespace, data) {
  if (arguments.length > 1) {
    return localStorage.setItem(namespace, JSON.stringify(data));
  } else {
    let store = localStorage.getItem(namespace);
    return (store && JSON.parse(store)) || [];
  }
}

function uuid() {
  /* jshint bitwise:false */
  let i, random;
  let uid = '';
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uid += '-';
    }
    uid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uid;
}


// *** bind events with functions ************************************************************** //
$("#todos_add_btn").on('click', addTodo);
// trigger the todos_add_btn click event by pressing the 'enter key' when using todos_input
$("#todos_input").on('keypress', addTodoByEnterKey);
$("#todos_list").on('click', "#todos_delete_btn", deleteTodo);
$("#todos_list").on('click', "#todos_add_sub_textbox_btn", addSubTextbox);
$("#todos_list").on('click', "#todos_save_sub_btn", saveSubTodo);
// trigger the todos_save_sub_btn click event by pressing the 'enter key' when using todos_subTextbox
$("#todos_list").on('keypress', "#todos_subTextbox", saveSubTodoByEnterKey);
$("#todos_list").on('click', "#todos_delete_sub_textbox_btn", deleteSubTextbox);
// trigger the todos_delete_sub_textbox_btn click event by pressing the 'escape key' when using todos_subTextbox
$("#todos_list").on('keydown', "#todos_subTextbox", deleteSubTextboxByEscapeKey);
$("#todos_list").on('click', ".todos_checkbox", toggleTodo);
$("#todos_list").on('dblclick', "#todos_title", edit);
$("#todos_list").on('click', "#todos_save_edit_btn", saveEdit);
// trigger the todos_save_edit_btn click event by pressing the 'enter key' when using todos_editTextbox
$("#todos_list").on('keypress', "#todos_editTextbox", saveEditByEnterKey);


// *** functions ******************************************************************************** //
function render(todos) {
  if (todos.length === 0) {
    $("#todos_list").html('');
    todosInput.val('');
    return;
  }
  $("#todos_list").html(todosTemplate(todos));
  todosInput.val('');
  // remove addTodoWarning message
  if(document.getElementById("todos_main").contains(document.getElementById("addTodoWarning"))){
    $("#addTodoWarning").remove();
  }
}

function todosTemplate(array) {
  let result ='<ul>';
  let subTextbox = '';

  array.forEach(function(item){
    let checked = item.completed ? "checked='checked'" : '';
    let completed = item.completed ? "class='completed'" : '';

    // set subTextbox back to default empty string
    subTextbox = '';

    // Recursive case:
    // add sub textbox when has sub todos
    if(item.subTodos.length > 0){
      subTextbox = todosTemplate(item.subTodos);
    }
    // base case: when no sub todos, do nothing
    
    // add html to browser dynamically
    result += `<li id="${item.id}">` +
                `<label id="todos_checkbox_container">` +
                  `<input type="checkbox" ${checked} class="todos_checkbox">` + 
                  `<span class="todos_checkmark"></span>` + `
                </label>`+
                `<span id="todos_title" ${completed}>${item.title}</span>` +
                `<button id="todos_add_sub_textbox_btn">+</button>` +
                `<button id="todos_delete_btn">x</button>` +
                `<div class="todos_edit_container"></div>` +
                subTextbox +
              `</li>`;
  });
  
  return result + '</ul>';
}

function addTodo(){
  // when todosInput is not empty or not just has spaces
  if(todosInput.val().trim() !== ''){
    // get the latest data from localStorage and update it
    todos.push({
      id: uuid(),
      title: todosInput.val(),
      completed: false,
      subTodos: [],
    });
    // update localStorage with the latest todos
    store("storage_todos", todos);
    // render latest todos to browser
    render(todos);
    // remove addTodoWarning message
    $("#addTodoWarning").remove();
    todosInput.focus();
  // when todosInput is empty or just has spaces
  } else {
    // only add the addTodoWarning message once
    if(!document.getElementById("todos_input_container").contains(document.getElementById("addTodoWarning"))){
      $("#todos_input_container").append(`<p id="addTodoWarning">Content required.</p>`);
    }
    todosInput.focus();
  }
}

function addTodoByEnterKey(e){
  // get the number of the pressed key
  let keycode = (e.keyCode ? e.keyCode : e.which);
  // Number 13 is the "Enter" key on the keyboard
  if(keycode === 13){ 
    // Cancel the default action, if needed
    e.preventDefault();
    // Trigger the button element with a click
    $("#todos_add_btn").click();
  }
}

function addSubTextbox(e){
  let id = e.target.parentElement.id;

  // add todos_subTextbox_div when no todos_subTextbox_div.
  // only add one in one time (can't add another one until previous one is saved or deleted)
  if(!document.getElementById("todos_list").contains(document.getElementById("todos_subTextbox_div"))){
    // add html to browser dynamically
    $("#" + id).append(
      `<div id="todos_subTextbox_div">` +
        `<input type="text" id="todos_subTextbox" placeholder="Add your sub todo here...">` +
        `<button id="todos_save_sub_btn">Save</button>` +
        `<button id="todos_delete_sub_textbox_btn">x</button>` +
      `</div>`
    );
  } else {
    // only add the addTodoWarning message once
    if(!document.getElementById("todos_subTextbox_div").contains(document.getElementById("addSubTextboxWarning"))){
      $("#todos_subTextbox_div").append(`<p id="addSubTextboxWarning">This one is not done yet.</p>`);
    }
    todosInput.focus();
  }
  $("#todos_subTextbox").focus();
}

function deleteSubTextbox() {
  $("#todos_subTextbox_div").remove();
}

function deleteSubTextboxByEscapeKey(e){
  // get the number of the pressed key
  let keycode = (e.keyCode ? e.keyCode : e.which);
  // Number 27 is the "Escape" key on the keyboard
  if(keycode === 27){ 
    // Cancel the default action, if needed
    e.preventDefault();
    // Trigger the button element with a click
    $("#todos_delete_sub_textbox_btn").click();
  }
}

function saveSubTodo(e){
  const todosSubTextbox = $("#todos_subTextbox");
  let currentItem = e.target.parentElement.parentElement;

  // call getLocation()
  let saveSubLocation = getLocation(currentItem);

  // when todosSubTextbox is not empty or not just has spaces
  if(todosSubTextbox.val().trim() !== ''){
    // get the latest data of a required item's subTodos array from localStorage and update it
    saveSubLocation.subTodos.push({
      id: uuid(),
      title: todosSubTextbox.val(),
      completed: false,
      subTodos: [],
    });

    store("storage_todos", todos);
    render(todos);
    todosInput.focus();
  // when todosSubTextbox is empty or just has spaces
  } else {
    // only add the saveSubTodoWarning message once
    if(!document.getElementById(currentItem.id).contains(document.getElementById("saveSubTodoWarning"))){
      $("#todos_subTextbox_div").append(`<p id="saveSubTodoWarning">Content required.</p>`);
    }
    $("#todos_subTextbox").focus();
  }
}

function saveSubTodoByEnterKey(e){
  // get the number of the pressed key
  let keycode = (e.keyCode ? e.keyCode : e.which);
  // Number 13 is the "Enter" key on the keyboard
  if(keycode === 13){ 
    // Cancel the default action, if needed
    e.preventDefault();
    // Trigger the button element with a click
    $("#todos_save_sub_btn").click();
  }
}
  
function getLocation(currentItem){
  let currentId = currentItem.id;
  let parentItem = currentItem.parentElement.parentElement;
  let itemLocation;
  
  // recursive case:
  if(parentItem !== document.getElementById("todos_list")){
    itemLocation = getLocation(parentItem);

    let currentSubIndex = itemLocation.subTodos.findIndex(function(item){
      return item.id === currentId;
    });

    itemLocation = itemLocation.subTodos[currentSubIndex];

    return itemLocation;
  // base case:
  } else {
    let currentIndex = todos.findIndex(function(item){
      return item.id === currentId;
    });

    itemLocation = todos[currentIndex];

    return itemLocation;
  }
}

function toggleTodo(e) {
  let id = e.target.parentElement.parentElement.id;

  // call toggledTodos()
  todos = toggledTodos(todos,id);
  
  store("storage_todos", todos);
  render(todos);
}

function toggledTodos(todos, id){
  todos.map(function(item){
    // recursive case:
    if(item.id !== id){
      toggledTodos(item.subTodos, id);
      
    // base case:
    } else {
      if(item.id === id){
        item.completed = !item.completed;
      }
    }
  });

  return todos;
}

function deleteTodo(e) {
  let id = e.target.parentElement.id;

  // call deleteFilter
  todos = deleteFilter(todos, id);

  store("storage_todos", todos);
  render(todos);
}

function deleteFilter(todos, id) {
  return todos.filter(function(item){
    if (item.subTodos.length > 0) {
      item.subTodos = deleteFilter(item.subTodos, id);

      // // only delete a todo item when no sub todos in it
      // return item;

      // allow to delete a todo item (including its sub todos)
      return item.id != id;

    } else {
      return item.id != id;
    }
  });
}

function edit(e){
  let currentItem = e.target.parentElement;
  let currentItemContainer = currentItem.querySelector(".todos_edit_container");

  // call getLocation()
  let editLocation = getLocation(currentItem);
  let oldTextInputValue = editLocation.title;

  // add todos_subTextbox_div when no todos_editTextbox_div.
  // only add one in one time (can't add another one until previous one is saved)
  if(!document.getElementById("todos_list").contains(document.getElementById("todos_editTextbox_div"))){
    // remove original todo item
    currentItem.querySelector("#todos_checkbox_container").remove();
    currentItem.querySelector("#todos_title").remove();
    currentItem.querySelector("#todos_add_sub_textbox_btn").remove();
    currentItem.querySelector("#todos_delete_btn").remove();
    
    // add edit textbox (with original todo title)
    currentItemContainer.innerHTML = 
    `<div id="todos_editTextbox_div">` + 
      `edit: ` +
      `<input type="text" id="todos_editTextbox" value="${oldTextInputValue}">` +
      `<button id="todos_save_edit_btn">Save</button>` +
    `</div>`;
  } else {
    // only add the editWarning message once
    if(!document.getElementById("todos_editTextbox_div").contains(document.getElementById("editWarning"))){
      $("#todos_editTextbox_div").append(`<p id="editWarning">This one is not done yet.</p>`);
    }
  }

  $("#todos_editTextbox").focus();
}

function saveEdit(e){
  let currentItem = e.target.parentElement.parentElement.parentElement;

  const todoeditTextbox = $("#todos_editTextbox");

  // call getLocation()
  let saveEditLocation = getLocation(currentItem);

  // when todoeditTextbox is not empty or not just has spaces
  if(todoeditTextbox.val().trim() !== ''){
    // put new text input value to local storage
    saveEditLocation.title = todoeditTextbox.val();

    store("storage_todos", todos);
    render(todos);
    todosInput.focus();
  // when todoeditTextbox is empty or just has spaces
  } else {
    // only add the saveSubTodoWarning message once
    if(!document.getElementById("todos_editTextbox_div").contains(document.getElementById("saveEditWarning"))){
      $("#todos_editTextbox_div").append(`<p id="saveEditWarning">Content required.</p>`);
    }
    todoeditTextbox.focus();
  }
}

function saveEditByEnterKey(e){
  // get the number of the pressed key
  let keycode = (e.keyCode ? e.keyCode : e.which);
  // Number 13 is the "Enter" key on the keyboard
  if(keycode === 13){ 
    // Cancel the default action, if needed
    e.preventDefault();
    // Trigger the button element with a click
    $("#todos_save_edit_btn").click();
  }
}

render(todos);