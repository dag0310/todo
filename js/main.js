/** 
 *  author: Daniel Geymayer
 *  version: 1.4.3
 *  date: 2013-07-05
 */

var timer;
var el_todo = document.getElementById("todo");
var el_todos = document.getElementById("todos");
var el_statusbar = document.getElementById("statusbar");
var el_notification = document.getElementById("notification");
var el_footer = document.getElementById("footer");

var address = "http://127.0.0.1/todo/data/";
var data_file = "todos.json";
var update_file = "update_json.php";
var todos = new Array();
var refreshRate = 5000;

var con = new connection();

$(function() {
	$.ajaxSetup({
		async: false,
		cache: false,
		timeout: 1500,
	});
	
	// Add ToDo
	$(document).on('click', '#add_todo', function() {
		if (el_todo.value.trim() == "") {
			updateStatusbar("No empty ToDos allowed");
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
				data: {
					todo_text: el_todo.value,
					file: data_file,
					cmd: "add",
				},
				success: ajax_success,
				error: ajax_error
			});
		} else refreshPage();
		
		updateStatusbar("'" + el_todo.value + "' added");
		el_todo.value = "";
		
		return false;
	});
	
	// Delete the selected ToDo
	$(document).on('click', 'a.ui-link-inherit', function() {
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
				data: {
					id: this.id,
					file: data_file,
					cmd: "del"
				},
				success: ajax_success,
				error: ajax_error
			});
		} else refreshPage();
		
		updateStatusbar("'" + todo_text + "' deleted");
		
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
				data: {
					file: data_file,
					cmd: "del_all"
				},
				success: ajax_success,
				error: ajax_error
			});
		} else refreshPage();
		
		updateStatusbar("All ToDos deleted");
		
		return false;
	});
	
	// Download from server (override local data)
	$(document).on('click', '#download', function() {
		$.ajax({
			type: "GET",
			url: address + data_file,
			success: download_success,
			error: download_error
		});
		
		return false;
	});
	
	// Upload to server (override server data)
	$(document).on('click', '#upload', function() {
		$.ajax({
			type: "POST",
			url: address + update_file,
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
	
	var status = localStorage.getItem("status");
	if (status == "false") {
		ajax_error();
	} else {
		timeoutPage(true);
	}
});

// AJAX FUNCTIONS
function upload_success() {
	updateStatusbar("Upload was successful")
	clearTimeout(timer);
	timeoutPage();
	ajax_success();
}

function upload_error() {
	updateStatusbar("Upload failed")
	ajax_error();
}

function download_success() {
	updateStatusbar("Download was successful")
	clearTimeout(timer);
	timeoutPage();
	ajax_success();
}

function download_error() {
	updateStatusbar("Download failed")
	ajax_error();
}

function ajax_success() {
	con.setStatus(true);
	refreshPage();
}

function ajax_error() {
	con.setStatus(false);
	refreshPage();
}

// MAIN FUNCTIONS
function timeoutPage(forceAjax) {
	if (forceAjax == null) forceAjax = false;
	refreshPage(forceAjax);
	// timer = setTimeout(timeoutPage, refreshRate);
}

function refreshPage(forceAjax) {
	if (forceAjax == null) forceAjax = false;
	
	// REFRESH LIST
	if (con.status || forceAjax) {
		todos = new Array();
		
		$.getJSON(address + data_file, function(data) {
			$.each(data, function(key, value) {
				todos.push(new todo(key, value.text));
			});
		})
		.done(function() {
			localStorage.setItem("todos", JSON.stringify(todos));
			con.setStatus(true);
		})
		.fail(function() {
			todos = JSON.parse(localStorage.getItem("todos"));
			con.setStatus(false);
		})
		.always(function() {
			refreshList();
		});
	} else {
		todos = JSON.parse(localStorage.getItem("todos"));
		refreshList();
	}
}

function refreshList() {
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
	
	// Set interface according to connection (online / offline)
	el_statusbar.style.backgroundColor = con.color;
	footer.style.display = con.footer_display;
}

function updateStatusbar(text) {
	if (text == null) text = "";
	if (text.trim() != "") {
		el_notification.innerHTML = text;
	}
	
	el_notification.style.display = "none";
	$('#notification').fadeIn(333);
}

/* 
 *  OBJECTS
 */
function todo(id, text) {
	this.id = id;
	this.text = text;
}

function connection(status) {
	this.setStatus = setStatus;
	if (status != null) this.setStatus(status);
	
	function setStatus(status) {
		this.status = status;
		localStorage.setItem("status", status);
		
		if (status) {
			this.color = "#479D34";
			this.footer_display = "none";
		} else {
			this.color = "#FF0000";
			this.footer_display = "";
		}
	}
}
