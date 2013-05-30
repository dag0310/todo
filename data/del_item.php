<?php
$id = $_POST['id'];
$file = $_POST['file'];

if (file_exists($file)) {
	$todos = simplexml_load_file($file);
} else {
	echo 'XML file not found!';
	exit;
}

// loop through all todos and delete the one with the ID supplied
foreach ($todos as $todo) {
	if ((int)$todo['id'] == (int)$id) {
		$dom = dom_import_simplexml($todo);
		$dom->parentNode->removeChild($dom);
	}
}

$todos->asXML($file);