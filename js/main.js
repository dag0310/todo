/** 
 *  author: Daniel Geymayer
 *  version: 1.2
 *  date: 2013-05-31
 */

address_dev = "http://10.0.0.109:98/todo/data/";
address_local = "data/";
address = address_dev;
data_file = "todos.json";
update_file = "update_json.php";
el_color = "red";
el_todo = document.getElementById("todo");
el_todos = document.getElementById("todos");
el_notification = document.getElementById("notification");

$(function() {
	$.ajaxSetup({
		async: false,
		cache: false,
	});
	
	// Add ToDo
	$(document).on('click', '#add_todo', function() {
		if (el_todo.value.trim() == "") {
			show_notification("No empty ToDos allowed!");
			return false;
		}
		
		$.ajax({
			type: "POST",
			url: address + update_file,
			cache: false,
			data: {
				todo_text: el_todo.value,
				file: data_file,
				cmd: "add",
			},
			success: refresh_list,
			error: refresh_list
		});
		
		return false;
	});
	
	// Delete the selected ToDo
	$(document).on('click', 'a', function() {
		$.ajax({
			type: "POST",
			url: address + update_file,
			cache: false,
			data: {
				id: this.id,
				file: data_file,
				cmd: "del"
			},
			success: refresh_list,
			error: refresh_list
		});
		
		return false;
	});
	
	// Delete all ToDos
	$(document).on('click', '#delete_all', function() {
		$.ajax({
			type: "POST",
				url: address + update_file,
				cache: false,
				data: {
					file: data_file,
					cmd: "del_all"
				},
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
	
	refresh_list();
});

function show_notification(text) {
	if (text.trim() != "") {
		notification.innerHTML = text;
		$("#notification").animate({
			bottom:'0px',
		});
		$("#notification").delay(2000);
		$("#notification").animate({
			bottom:'-30px',
		});
	}
}

function refresh_list() {
	var todos = get_todos();
	el_todos.innerHTML = "";
	
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
		
		el_todos.appendChild(li);
	}
	
	el_todo.value = "";
	show_notification("List refreshed");
	$('ul#todos').listview('refresh');
}

function get_todos() {
	var todos = new Array();
	var message = "";
	
	$.getJSON(address + data_file, function(data) {
		$.each(data, function(key, value) {
			todos.push(new todo(key, value.text));
		});
	})
	.done(function() {
		localStorage.setItem("todos", JSON.stringify(todos));
		color = "green";
	})
	.fail(function() {
		todos = JSON.parse(localStorage.getItem("todos"));
		message = "Watch out! you are offline!"
		color = "red";
	});
	
	show_notification(message);
	
	return todos;
}

function todo(id, text) {
	this.id = id;
	this.text = text;
}