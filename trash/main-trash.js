function add_item(text) {
	if (text.trim() == "") {
		alert("No empty ToDos allowed!");
		return;
	}
	var todos = new Array();
	var request = new XMLHttpRequest();
	request.open("POST", address + php_add, true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.send("text=" + text + "&file=" + xml_file);
	todos = load_items();
	localStorage.setItem("todos", JSON.stringify(todos));
	refresh_list();
}

function delete_item(id) {
	var todos = new Array();
	var request = new XMLHttpRequest();	
	request.open("POST", address + php_del, true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.send("id=" + id + "&file=" + xml_file);
	todos = load_items();
	localStorage.setItem("todos", JSON.stringify(todos));
}