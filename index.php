<!DOCTYPE html>
<html manifest="todo.manifest" lang="en">
<head>
	<title>ToDo</title>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
	<meta name="author" content="Daniel Geymayer">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black">
	<link rel="icon" href="favicon.png" type="image/png">
	<link rel="apple-touch-icon-precomposed" href="img/apple-touch-icon-precomposed.png">
	<link rel="apple-touch-startup-image" href="img/startup.png">
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.css">
	<link rel="stylesheet" href="css/style.css">
	<script>var baseUrl = '<?php include('base_url.php'); echo base_url()?>'</script>
</head>
<body>
<div id="container">
	<div id="pullrefresh">
        <div class="message">
            <div id="pullrefresh-icon" class="icon arrow arrow-down"></div>
            <span></span>
        </div>
    </div>
    
	<div id="statusbar"><div id="notification">Welcome to ToDo!</div></div>
	<div data-role="page" id="main" data-title="ToDo">
		<div data-role="header"></div>
		<div data-role="content">
			<form>
				<input type="text" id="todo" name="todo" value="" placeholder="What do you have ToDo?" />
				<input type="submit" data-type="button" id="add_todo" data-icon="plus" data-iconpos="left" data-mini="true" data-theme="b" value="Add" />
			</form>
			<ul id="todos" data-role="listview" data-inset="true"></ul>
		</div>
	</div>
</div>
	<div id="footer">
        <input type="button" data-type="button" id="download" data-icon="arrow-d" data-iconpos="left" data-mini="true" data-theme="b" value="Download" />
        <input type="button" data-type="button" id="upload" data-icon="arrow-u" data-iconpos="left" data-mini="true" data-theme="b" value="Upload" />
    </div>
	<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.js"></script>
	<script src="js/hammer.min.js"></script>
	<script src="js/modernizr.js"></script>
	<script src="js/main.js"></script>
	<!--[if lt IE 9]>
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
</body>
</html>
