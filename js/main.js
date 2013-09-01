/**
 *  author: Daniel Geymayer
 *  version: 1.5
 *  date: 2013-08-29
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
				url : address + update_file,
				data : {
					todo_text : el_todo.value,
					file : data_file,
					cmd : "add",
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
				url : address + update_file,
				data : {
					id : this.id,
					file : data_file,
					cmd : "del"
				},
				success : ajax_success,
				error : ajax_error
			});
		} else
			refreshPage();

		updateStatusbar("'" + todo_text + "' deleted");

		return false;
	});

	// Delete all ToDos
	$(document).on('click', '#delete_all', function() {
		todos = new Array();
		localStorage.setItem("todos", JSON.stringify(todos));

		if (con.status) {
			$.ajax({
				type : "POST",
				url : address + update_file,
				data : {
					file : data_file,
					cmd : "del_all"
				},
				success : ajax_success,
				error : ajax_error
			});
		} else
			refreshPage();

		updateStatusbar("All ToDos deleted");

		return false;
	});

	// Download from server (override local data)
	$(document).on('click', '#download', function() {
		$.ajax({
			type : "GET",
			url : address + data_file,
			success : download_success,
			error : download_error
		});

		return false;
	});

	// Upload to server (override server data)
	$(document).on('click', '#upload', function() {
		$.ajax({
			type : "POST",
			url : address + update_file,
			data : {
				todos : todos,
				file : data_file,
				cmd : "set",
			},
			success : upload_success,
			error : upload_error
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
	updateStatusbar("Upload was successful");
	clearTimeout(timer);
	timeoutPage();
	ajax_success();
}

function upload_error() {
	updateStatusbar("Upload failed");
	ajax_error();
}

function download_success() {
	updateStatusbar("Download was successful");
	clearTimeout(timer);
	timeoutPage();
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
function timeoutPage(forceAjax) {
	if (forceAjax == null)
		forceAjax = false;
	refreshPage(forceAjax);
	// timer = setTimeout(timeoutPage, refreshRate);
}

function refreshPage(forceAjax) {
	if (forceAjax == null)
		forceAjax = false;

	// REFRESH LIST
	if (con.status || forceAjax) {
		todos = new Array();

		$.getJSON(address + data_file, function(data) {
			$.each(data, function(key, value) {
				todos.push(new todo(key, value.text));
			});
		}).done(function() {
			localStorage.setItem("todos", JSON.stringify(todos));
			con.setStatus(true);
		}).fail(function() {
			todos = JSON.parse(localStorage.getItem("todos"));
			con.setStatus(false);
		}).always(function() {
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
	if (status != null)
		this.setStatus(status);

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

/* JQUERY */
/**
 * requestAnimationFrame and cancel polyfill
 */
( function() {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function(callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() {
					callback(currTime + timeToCall);
				}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};

		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
	}());

/**
 * pull to refresh
 * @type {*}
 */
var PullToRefresh = (function() {
	function Main(container, slidebox, slidebox_icon, handler) {
		var self = this;

		this.breakpoint = 80;

		this.container = container;
		this.slidebox = slidebox;
		this.slidebox_icon = slidebox_icon;
		this.handler = handler;

		this._slidedown_height = 0;
		this._anim = null;
		this._dragged_down = false;

		this.hammertime = Hammer(this.container).on("touch dragdown release", function(ev) {
			self.handleHammer(ev);
		});
	};

	/**
	 * Handle HammerJS callback
	 * @param ev
	 */
	Main.prototype.handleHammer = function(ev) {
		var self = this;

		switch(ev.type) {
			// reset element on start
			case 'touch':
				this.hide();
				break;

			// on release we check how far we dragged
			case 'release':
				if (!this._dragged_down) {
					return;
				}

				// cancel animation
				cancelAnimationFrame(this._anim);

				// over the breakpoint, trigger the callback
				if (ev.gesture.deltaY >= this.breakpoint) {
					container_el.className = 'pullrefresh-loading';
					pullrefresh_icon_el.className = 'icon loading';

					this.setHeight(60);
					this.handler.call(this);
				}
				// just hide it
				else {
					pullrefresh_el.className = 'slideup';
					container_el.className = 'pullrefresh-slideup';

					this.hide();
				}
				break;

			// when we dragdown
			case 'dragdown':
				this._dragged_down = true;

				// if we are not at the top move down
				var scrollY = window.scrollY;
				if (scrollY > 5) {
					return;
				} else if (scrollY !== 0) {
					window.scrollTo(0, 0);
				}

				// no requestAnimationFrame instance is running, start one
				if (!this._anim) {
					this.updateHeight();
				}

				// stop browser scrolling
				ev.gesture.preventDefault();

				// update slidedown height
				// it will be updated when requestAnimationFrame is called
				this._slidedown_height = ev.gesture.deltaY * 0.4;
				break;
		}
	};

	/**
	 * when we set the height, we just change the container y
	 * @param   {Number}    height
	 */
	Main.prototype.setHeight = function(height) {
		if (Modernizr.csstransforms3d) {
			this.container.style.transform = 'translate3d(0,' + height + 'px,0) ';
			this.container.style.oTransform = 'translate3d(0,' + height + 'px,0)';
			this.container.style.msTransform = 'translate3d(0,' + height + 'px,0)';
			this.container.style.mozTransform = 'translate3d(0,' + height + 'px,0)';
			this.container.style.webkitTransform = 'translate3d(0,' + height + 'px,0) scale3d(1,1,1)';
		} else if (Modernizr.csstransforms) {
			this.container.style.transform = 'translate(0,' + height + 'px) ';
			this.container.style.oTransform = 'translate(0,' + height + 'px)';
			this.container.style.msTransform = 'translate(0,' + height + 'px)';
			this.container.style.mozTransform = 'translate(0,' + height + 'px)';
			this.container.style.webkitTransform = 'translate(0,' + height + 'px)';
		} else {
			this.container.style.top = height + "px";
		}
	};

	/**
	 * hide the pullrefresh message and reset the vars
	 */
	Main.prototype.hide = function() {
		container_el.className = '';
		this._slidedown_height = 0;
		this.setHeight(0);
		cancelAnimationFrame(this._anim);
		this._anim = null;
		this._dragged_down = false;
	};

	/**
	 * hide the pullrefresh message and reset the vars
	 */
	Main.prototype.slideUp = function() {
		var self = this;
		cancelAnimationFrame(this._anim);

		pullrefresh_el.className = 'slideup';
		container_el.className = 'pullrefresh-slideup';

		this.setHeight(0);

		setTimeout(function() {
			self.hide();
		}, 500);
	};

	/**
	 * update the height of the slidedown message
	 */
	Main.prototype.updateHeight = function() {
		var self = this;

		this.setHeight(this._slidedown_height);

		if (this._slidedown_height >= this.breakpoint) {
			this.slidebox.className = 'breakpoint';
			this.slidebox_icon.className = 'icon arrow arrow-up';
		} else {
			this.slidebox.className = '';
			this.slidebox_icon.className = 'icon arrow';
		}

		this._anim = requestAnimationFrame(function() {
			self.updateHeight();
		});
	};

	return Main;
})();

function getEl(id) {
	return document.getElementById(id);
}

var container_el = getEl('container');
var pullrefresh_el = getEl('pullrefresh');
var pullrefresh_icon_el = getEl('pullrefresh-icon');
var image_el = getEl('random-image');

var refresh = new PullToRefresh(container_el, pullrefresh_el, pullrefresh_icon_el);

// update image onrefresh
refresh.handler = function() {
	refreshPage();
	this.slideUp();
	updateStatusbar("Refresh triggered");
};