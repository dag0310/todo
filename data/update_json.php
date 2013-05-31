<?php
$file = $_POST['file'];
$cmd = $_POST['cmd'];

if (file_exists($file)) {
	$json = json_decode(file_get_contents($file), true);
	
	switch ($cmd) {
		case 'add':
			$todo_text = $_POST['todo_text'];
			if (trim($todo_text) == '') {
				echo 'No empty ToDos allowed!';
				exit;
			}
			
			// determine the maximum id in the structure and increase by 1
			$id = 0;
			foreach ($json as $key => $value) {
				if ((int) $key > $id) $id = (int) $key;
			}
			
			// add a child with ID as attribute and text as child
			$json[$id + 1] = array('text' => $todo_text, 'timestamp' => date('Y-m-d'));
			break;
		case 'del':
			unset($json[$_POST['id']]);
			break;
		case 'del_all':
			foreach ($json as $key => $value) {
				unset($json[$key]);
			}
			break;
		default:
			echo 'Command not found!';
			exit;
	}
	
	// save JSON to file
	file_put_contents($file, json_encode($json));
} else {
	echo 'File not found!';
	exit;
}