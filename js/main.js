/** 
 *  author: Daniel Geymayer
 *  version: 1.3
 *  date: 2013-06-14
 */

var address_dev = "http://localhost/todo/data/";
var address = address_dev;
var data_file = "todos.json";
var update_file = "update_json.php";
var con = new connection(true);
var todos = new Array();
var el_todo = document.getElementById("todo");
var el_todos = document.getElementById("todos");
var el_statusbar = document.getElementById("statusbar");
var el_footer = document.getElementById("footer");

$(function() {
	$.ajaxSetup({
		async: false,
		cache: false,
		timeout: 2000,
	});
	
	// Add ToDo
	$(document).on('click', '#add_todo', function() {
		if (el_todo.value.trim() == "") {
			show_notification("No empty ToDos allowed!");
			return false;
		}
		
		var id = 0;
		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id > id) id = todos[i].id;
		}
		todos.push(new todo(id + 1, el_todo.value));
		localStorage.setItem("todos", JSON.stringify(todos));
		
		if (con.status) {
			$.ajax({
				type: "POST",
				url: address + update_file,
				cache: false,
				data: {
					todo_text: el_todo.value,
					file: data_file,
					cmd: "add",
				},
				success: ajax_success,
				error: ajax_error
			});
		}
		
		show_notification("'" + el_todo.value + "' added.");
		el_todo.value = "";
		
		return false;
	});
	
	// Delete the selected ToDo
	$(document).on('click', 'a', function() {
		var todo_text = "";
		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == this.id) {
				todo_text = todos[i].text;
				todos.splice(i, 1);
			}
		}
		localStorage.setItem("todos", JSON.stringify(todos));
		
		if (con.status) {
			$.ajax({
				type: "POST",
				url: address + update_file,
				cache: false,
				data: {
					id: this.id,
					file: data_file,
					cmd: "del"
				},
				success: ajax_success,
				error: ajax_error
			});
		}
		
		show_notification("'" + todo_text + "' deleted.");
		
		return false;
	});
	
	// Delete all ToDos	
	$(document).on('click', '#delete_all', function() {
		todos = new Array();
		localStorage.setItem("todos", JSON.stringify(todos));
		
		if (con.status) {
			$.ajax({
				type: "POST",
					url: address + update_file,
					cache: false,
					data: {
						file: data_file,
						cmd: "del_all"
					},
					success: ajax_success,
					error: ajax_error
			});
		}
		
		show_notification("All ToDos deleted.");
		
		return false;
	});
	
	// Download from server (override local data)
	$(document).on('click', '#download', function() {
		ajax_success();
		
		return false;
	});
	
	// Upload to server (override server data)
	$(document).on('click', '#upload', function() {
		$.ajax({
			type: "POST",
			url: address + update_file,
			cache: false,
			data: {
				todos: todos,
				file: data_file,
				cmd: "set",
			},
			success: upload_success,
			error: upload_error
		});
		
		return false;
	});
	
	refresh();
});

function upload_success() {
	show_notification("Upload was successful.")
	ajax_success();
}

function upload_error() {
	show_notification("Upload failed.")
	ajax_error();
}

function ajax_success() {
	con.setStatus(true);
	refresh();
}

function ajax_error() {
	con.setStatus(false);
	refresh();
}

function refresh() {
	el_statusbar.style.backgroundColor = con.color;
	footer.style.display = con.footer_display;
	refresh_list();
	timer = setTimeout(refresh, 15000);
}

function refresh_list() {
	refresh_todos();
	el_todos.innerHTML = "";
	
	// Create list items for all ToDos in the list and append them to the list
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
	
	$('ul#todos').listview('refresh');
}

function refresh_todos() {
	if (con.status) {
		todos = new Array();
		$.getJSON(address + data_file, function(data) {
			$.each(data, function(key, value) {
				todos.push(new todo(key, value.text));
			});
		})
		.done(function() {
			localStorage.setItem("todos", JSON.stringify(todos));
		})
		.fail(function() {
			todos = JSON.parse(localStorage.getItem("todos"));
			con.setStatus(false);
			show_notification("Could not establish connection.");
		});
	} else {
		todos = JSON.parse(localStorage.getItem("todos"));
	}
}

function show_notification(text) {
	if (text.trim() != "") {
		el_statusbar.innerHTML = text;
	}
}

function todo(id, text) {
	this.id = id;
	this.text = text;
}

function connection(status) {
	this.setStatus = setStatus;
	this.setStatus(status);
	
	function setStatus(status) {
		this.status = status;
		if (status) {
			this.color = "#479D34";
			this.footer_display = "none";
		} else {
			this.color = "#FF0000";
			this.footer_display = "";
		}
	}
}
