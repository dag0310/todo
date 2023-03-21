<?php
$cmd = $_POST['cmd'];
// $cmd = 'get_list';
$db = new SQLite3('todo.db');

switch ($cmd) {
	case 'login' :
		login($db, $_POST['username'], $_POST['password']);
		break;
	case 'get_list' :
		get_list($db, $_POST['list_id']);
		// get_list($db, 1);
		break;
	case 'set_list' :
		set_list($db, $_POST['list_id'], $_POST['json_list']);
		break;
	case 'add_todo' :
		add_todo($db, $_POST['todo_text'], $_POST['list_id']);
		break;
	case 'del_todo' :
		del_todo($db, $_POST['todo_id']);
		break;
}

$db->close();

/*
 *  FUNCTIONS
 */

function login($db, $username, $password) {
	// Set data
	$user_exists = FALSE;
	$password_correct = FALSE;

	// Get username and password if user exists
	$users = $db->query("SELECT id, username, password FROM user WHERE username = '$username'");

	// Check if user exists and the password is correct
	while ($user = $users->fetchArray(SQLITE3_ASSOC)) {
		$user_id = $user['id'];
		$user_exists = TRUE;
		$password_correct = ($password === $user['password']) ? TRUE : FALSE;
	}

	if ($password_correct) {
		// Return user ID
		echo "$user_id";
	} else if (!$user_exists AND trim($username) != '') {
		// Create user
		$name = "Anonymous";
		$create_time = date('Y-m-d H:i:s');
		$sql = "INSERT INTO user (username, password, name, create_time) VALUES('$username', '$password', '$name', '$create_time')";
		$db->exec($sql);
		$user_id = $db->lastInsertRowID();

		// Create default list
		$sql = "INSERT INTO list (title, creator_user_id, create_time) VALUES('Default', $user_id, '$create_time')";
		$db->exec($sql);
		$list_id = $db->lastInsertRowID();

		// Create user_list entry for the new user and their default list
		$sql = "INSERT INTO user_list (user_id, list_id) VALUES($user_id, $list_id)";
		$db->exec($sql);

		// Return user ID
		echo "$user_id";
	} else {
		// Do not grant login
		echo '0';
	}
}

function get_list($db, $list_id) {
	// Get all ToDos of a user's list
	$sql = "
		SELECT id, text
		FROM todo
		WHERE list_id = $list_id
		ORDER BY position ASC";
	$todos = $db->query($sql);

	$todos_new = array();
	while ($todo = $todos->fetchArray(SQLITE3_ASSOC)) {
		$todos_new[$todo['id']] = $todo['text'];
	}

	echo json_encode($todos_new);
}

function set_list($db, $list_id, $json_list) {
	// Overwrite list in database
}

function add_todo($db, $todo_text, $list_id) {
	// Text
	$todo_text = $db->escapeString($todo_text);

	// Position
	$position = 1 + $db->querySingle("SELECT MAX(position) FROM todo WHERE list_id = $list_id");

	// Create time
	$create_time = date('Y-m-d H:i:s');

	// Add ToDo to the database
	$sql = "INSERT INTO todo (text, position, list_id, create_time) VALUES ('$todo_text', $position, $list_id, '$create_time')";
	$db->exec($sql);
}

function del_todo($db, $todo_id) {
	$db->exec("DELETE FROM todo WHERE id = $todo_id");
}
