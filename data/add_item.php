<?php
$todo_text = $_POST['todo_text'];
$file = $_POST['file'];

if (file_exists($file)) {
	$todos = simplexml_load_file($file);
} else {
	echo 'XML file not found!';
	exit;
}

if (trim($todo_text) == '') {
	echo 'No empty ToDos allowed!';
	exit;
}

// determine the maximum id in the xml structure and increase by 1
$id = 0;
foreach ($todos as $todo) {
	if ((int)$todo['id'] > $id) $id = (int)$todo['id'];
}

// add a child with ID as attribute and text as child
$todo = $todos->addChild('todo', $todo_text);
$todo->addAttribute('id', $id + 1);

$todos->asXML($file);