<?php
$file = $_POST['file'];

if (file_exists($file)) {
	$todos = simplexml_load_file($file);
} else {
	echo 'XML file not found!';
	exit;
}

unset($todos->todo);

$todos->asXML($file);