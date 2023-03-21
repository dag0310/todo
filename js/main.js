/**
 *  author: Daniel Geymayer
 *  version: 2.0
 *  date: 2013-09-01
 */

var timer;
var el_todo = document.getElementById("todo");
var el_todos = document.getElementById("todos");
var el_statusbar = document.getElementById("statusbar");
var el_notification = document.getElementById("notification");
var el_footer = document.getElementById("footer");

var address = "http://127.0.0.1/todo/data/";
var data_access_file = "access.php";
var todos = new Array();

var con = new connection();

$(function() {
	$.ajaxSetup({
		async : false,
		cache : false,
		timeout : 1500,
	});

	// Add ToDo
	$(document).on('click', '#add_todo', function() {
		if (el_todo.value.trim() == "") {
			updateStatusbar("No empty ToDos allowed");
			return false;
		}

		var id = 0;
		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id > id)
				id = todos[i].id;
		}
		todos.push(new todo(id + 1, el_todo.value));
		localStorage.setItem("todos", JSON.stringify(todos));

		if (con.status) {
			$.ajax({
				type : "POST",
				url : address + data_access_file,
				data : {
					todo_text : el_todo.value,
					list_id : 1,
					cmd : "add_todo",
				},
				success : ajax_success,
				error : ajax_error
			});
		} else
			refreshPage();

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
				type : "POST",
				url : address + data_access_file,
				data : {
					todo_id : this.id,
					cmd : "del_todo"
				},
				success : ajax_success,
				error : ajax_error
			});
		} else
			refreshPage();

		updateStatusbar("'" + todo_text + "' deleted");

		return false;
	});

	// Download from server (override local data)
	$(document).on('click', '#download', function() {
		$.ajax({
			type : "GET",
			url : address + 'todo.db',
			success : download_success,
			error : download_error
		});

		return false;
	});

	// Upload to server (override server data)
	$(document).on('click', '#upload', function() {
		$.ajax({
			type : "POST",
			url : address + data_access_file,
			data : {
				list_id : 1,
				json_list : todos,
				cmd : "set_list",
			},
			success : upload_success,
			error : upload_error
		});

		return false;
	});

	// Login
	$(document).on('click', '#btLogin', function() {
		$.ajax({
			type : "POST",
			url : address + data_access_file,
			data : {
				username : document.getElementById("username").value,
				password : md5(document.getElementById("password").value),
				cmd : "login",
			},
			dataType : 'text',
			success : loginCallback,
			error : loginCallback
		});

		return false;
	});

	// Execute at page load
	var status = localStorage.status;
	if (status == "false") {
		alert(status);
		ajax_error();
	} else {
		refreshPage(true);
	}
});

// AJAX FUNCTIONS
function loginCallback(result) {
	localStorage.user_id = result;
	self.location = "";
}

function upload_success() {
	updateStatusbar("Upload was successful");
	clearTimeout(timer);
	refreshPage();
	ajax_success();
}

function upload_error() {
	updateStatusbar("Upload failed");
	ajax_error();
}

function download_success() {
	updateStatusbar("Download was successful");
	clearTimeout(timer);
	refreshPage();
	ajax_success();
}

function download_error() {
	updateStatusbar("Download failed");
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
function refreshPage(forceAjax) {
	forceAjax = (forceAjax == null) ? false : true;

	// REFRESH LIST
	if (con.status || forceAjax) {
		todos = new Array();

		// Get todos of list
		$.ajax({
			type : "POST",
			url : address + data_access_file,
			data : {
				user_id : localStorage.user_id,
				list_id : localStorage.user_id,
				cmd : "get_list",
			},
			dataType : 'json',
			success : refreshCallbackSuccess,
			error : refreshCallbackError
		});
	} else {
		todos = JSON.parse(localStorage.todos);
		refreshList();
	}
}

function refreshCallbackSuccess(data) {
	$.each(data, function(key, value) {
		todos.push(new todo(key, value));
	});
	
	localStorage.todos = JSON.stringify(todos);
	con.setStatus(true);
	refreshList();
}

function refreshCallbackError(data) {
	todos = JSON.parse(localStorage.todos);
	con.setStatus(false);
	refreshList();
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
	if (text == null)
		text = "";
	if (text.trim() != "") {
		el_notification.innerHTML = text;
	}

	el_notification.style.display = "none";
	$('#notification').fadeIn(333);
}

/* OBJECTS */
function todo(id, text) {
	this.id = id;
	this.text = text;
}

function connection(status) {
	this.setStatus = setStatus;
	if (status != null) {
		this.setStatus(status);
	}

	function setStatus(status) {
		this.status = status;
		localStorage.status = status;

		if (status) {
			this.color = "#479D34";
			this.footer_display = "none";
		} else {
			this.color = "#FF0000";
			this.footer_display = "";
		}
	}

}
