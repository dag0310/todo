/** 
 *  author: Daniel Geymayer
 *  version: 1.1
 *  date: 2013-05-20
 */

address_dev = "10.63.26.21:98/todo/";
address_local = "";
address = address_dev;
xml_file = "data/todos.xml";
php_add = "data/add_item.php";
php_del = "data/del_item.php";
php_delall = "data/del_all.php";

// Add ToDo
$(document).on('click', '#add_todo', function() {
	var todo = document.getElementById("todo");
	if (todo.value.trim() == "") {
		todo.placeholder = "No empty ToDos allowed!";
		refresh_list();
		return false;
	}
	
	$.ajax({
		type: "POST",
		url: address + php_add,
		cache: false,
		data: { todo_text: todo.value, file: xml_file },
		success: refresh_list,
		error: refresh_list
	});
	
	return false;
});

// Delete all ToDos
$(document).on('click', '#delete_all', function() {
$.ajax({
	type: "POST",
		url: address + php_delall,
		cache: false,
		data: { file: xml_file },
		success: refresh_list,
		error: refresh_list
	});
	
	return false;
});

// Refresh the list
$(document).on('click', '#refresh', function() {
	refresh_list();
	return false;
});

// Delete the selected ToDo
$(document).on('click', 'a', function() {
	$.ajax({
		type: "POST",
		url: address + php_del,
		cache: false,
		data: { id: this.id, file: xml_file },
		success: refresh_list,
		error: refresh_list
	});
	
	return false;
});

$(document).ready(function() {
	refresh_list();
});

function refresh_list() {
	var todos = load_items();
	var ul = document.getElementById("todos");
	ul.innerHTML = "";
	
	// create list items for all todos in the list and append them to the list
	for (var i = 0; i < todos.length; i++) {
		var id = todos[i].id;
		var text = todos[i].text;
		
		var a = document.createElement("a");
		a.setAttribute("id", id);
		a.appendChild(document.createTextNode(text));
		
		var li = document.createElement("li");
		li.setAttribute("data-theme", "d");
		li.setAttribute("data-icon", "delete");
		li.appendChild(a);
		
		ul.appendChild(li);
	}
	
	var todo = document.getElementById("todo");
	todo.value = "";
	todo.placeholder = "What do you have ToDo?";
	$('ul#todos').listview('refresh');
}

function load_items() {
	// load items via AJAX
	var request = new XMLHttpRequest();
	request.open("GET", address + xml_file, false);
	request.send();
	
	var todos = new Array();
	if (request.readyState == 4 && request.status == 200) {
		// Load items via AJAX
		var xml_todos = request.responseXML.getElementsByTagName("todo");
		
		for (var i = 0; i < xml_todos.length; i++) {
		    var xml_todo = xml_todos[i];
		    var todo = new Object();
			todo.id = parseInt(xml_todo.getAttribute("id"));
			todo.text = xml_todo.childNodes[0].nodeValue;
			todos.push(todo);
		}
		
		// Save loaded items into localStorage
		localStorage.setItem("todos", JSON.stringify(todos));
	} else {
		// Load items from localStorage
		todos = JSON.parse(localStorage.getItem("todos"));
		$('#notification').text("Showing offline data!");
	}
	
	return (todos != null) ? todos : new Array();
}