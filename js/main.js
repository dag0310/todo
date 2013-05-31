/** 
 *  author: Daniel Geymayer
 *  version: 1.2
 *  date: 2013-05-31
 */

address_dev = "http://10.0.0.109:98/todo/";
address_local = "";
address = address_dev;
xml_file = "data/todos.xml";
json_file = "data/todos.json";
php_add = "data/add_item.php";
php_del = "data/del_item.php";
php_delall = "data/del_all.php";

$(function() {
	$.ajaxSetup({
		async: false
	});

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
	
	// Refresh the list
	$(document).on('click', '#refresh', function() {
		refresh_list();
		return false;
	});
	
	// $.ajax({
			// dataType: "json",
			// url: address + json_file,
			// cache: false,
			// success: load_items,
			// error: refresh_list
		// });
	
	refresh_list();
});

function refresh_list() {
	var todos = get_todos();
	var ul = document.getElementById("todos");
	ul.innerHTML = "";
	
	// create a list items for all todos in the list and append them to the list
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

function get_todos() {
	var todos = new Array();
	var color = "red";
	
	$.getJSON(address + json_file, function(data) {
		$.each(data, function(key, value) {
			todos.push(new todo(key, value.text));
		});
	})
	.done(function() {
		console.log("ONLINE");
		localStorage.setItem("todos", JSON.stringify(todos));
		color = "green";
	})
	.fail(function() {
		console.log("OFFLINE");
		todos = JSON.parse(localStorage.getItem("todos"));
	});
	
	// document.body.style.backgroundColor = color;
	
	return todos;
}

function todo(id, text) {
	this.id = id;
	this.text = text;
}