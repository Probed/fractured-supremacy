<?php
/*
 * Main Game Entry Point
 */

class fs_Main {

    private static $out = array(); //json arry to be returned to client
    private static $css = array(); //array of queued css files
    private static $js = array(); //array of queued js files
    private static $xhr = array(); //array of queued ajax function calls

    /**
     * game entry point
     *
     * @param type $loggedin //used by wordpress admin to assume a logged in state
     */

    public static function main($loggedin = false) {

	if ($loggedin) {
	    fs_User::me()->setLoggedIn(true);
	}

	self::init();
	self::load();
	self::process();

	if ($_GET['admin']) {
	    self::q_css("admin");
	}
	self::end();
    }

    private static function init() {
	self::q_xhr('install', 'fs_Main::install');

	self::q_js('vendor/MooTools-Core-1.6.0-compressed');
	self::q_js('vendor/MooTools-More-1.6.0-compressed');
	self::q_js('vendor/Array.sortOn');
	self::q_js('vendor/Drag.Move.Collide');
	self::q_js('vendor/FancySortable');
	self::q_js('vendor/Base64');
	self::q_js('vendor/string.md5');
	self::q_js('vendor/string.utf8');
	self::q_js('vendor/sanitize');

	self::q_css("fs_Scss");
	self::q_css("fs_Reset");

	self::q_css('fs_Debug');
	self::q_js('fs_Debug');

	self::q_css("fs_Global");

	self::q_js("fs_Global");

	self::q_js("fs_Form");
	self::q_css("fs_Form");

	self::q_css("fs_Window");
	self::q_js("fs_Window");


	self::q_js("fs_Tabs");
	self::q_css("fs_Tabs");

	self::q_js("fs_Message");
	self::q_css("fs_Message");
    }

    /**
     * Performs the install script
     */
    public static function install() {
	session_destroy();
	fs_Install::run_scripts();
    }

    /**
     * return the link tag for the queued stylesheets or an array of the queued sheets
     *
     * @param boolean $link if true the link tag is returned instead of an array
     * @return string the style tag or array of style sheets queued for output
     */
    public static function getCSS($link = false) {
	$files = array();
	//Style Sheets
	foreach (self::$css as $file => $opts) {
	    if (strstr($file, "http")) {
		$out .= '<link href="' . $file . '" rel="stylesheet">' . "\n";
	    } else {
		if (file_exists(DOCUMENT_ROOT . '/css/' . $file . '.scss')) {
		    array_push($files, $file);
		} else {
		    error("Missing SCSS File", $file);
		}
	    }
	}
	if (!empty($files)) {
	    if ($link) {
		return '<link href="' . ROOT_URL . 'index.php?xhr=true&css=' . implode(",", $files) . '" rel="stylesheet" />' . "\n";
	    } else {
		return ROOT_URL . 'index.php?xhr=true&css=' . implode(",", $files);
	    }
	}
    }

    /**
     * get javascript files or script tag for the header
     *
     * @param boolean $link if true return script tag otherwise return array of js files
     * @return string script tag or array of queued scripts
     */
    public static function getJS($link = false) {
	$out = '';
	$files = array();
	foreach (self::$js as $file => $opts) {
	    if (strstr($file, "http")) {

		$out .= '<script src="' . $file . '" type="text/javascript"></script>' . "\n";
		$files[$file] = $file;
	    } else {
		if (file_exists(DOCUMENT_ROOT . '/js/' . $file . '.js')) {
		    $out .= '<script src="js/' . $file . '.js" type="text/javascript"></script>' . "\n";
		    $files[$file] = ROOT_URL . 'js/' . $file . '.js';
		} else {
		    error("Missing JS File", $file);
		}
	    }
	}
	if ($link) {
	    return $out;
	} else {
	    return $files;
	}
    }

    /**
     * Outputs the header for the game &lt;head&gt;&lt;/head&gt;
     *
     * @return string
     */
    private static function get_header() {
	$out = '';

	$out .= '<title>' . CONFIG["title"] . '</title>' . "\n";
	$out .= '   <meta charset="UTF-8">
	<meta name="description" content="">
	<meta name="keywords" content="">
	<meta name="author" content="">
	<meta name="viewport" content="width=device-width, height=device-height, maximum-scale=1.0, minimum-scale=1.0, initial-scale=1.0"/>
	<link rel="shortcut icon" type="image/png" href="favicon.png"/>
	';

	$out .= self::getCSS(true);
	$out .= self::getJS(true);
	return $out;
    }

    /**
     * queues a key/value pair for output at the end of an ajax request
     *
     * @param string $key
     * @param mixed $value
     */
    public static function q_response($key, $value) {
	if (!isset(self::$out[$key])) {
	    self::$out[$key] = $value;
	    fs_Debug::log('Adding Output', TRACE, $key);
	}
	self::$out[$key] = $value;
    }

    /**
     * queue a javasscript file for output in the header
     *
     * @param boolean $link if true, root url is not prepended
     * @return null
     */
    public static function q_js($script, $options = array()) {
	if (isset($_GET["xhr"])) {
	    return;
	}
	if (!isset(self::$js[$script])) {
	    self::$js[$script] = $options;
	    //fs_Debug::log('Queueing JS File', TRACE, $script);
	}
	self::$js[$script] = $options;
    }

    /**
     * queue a stylesheet file for output in the header
     *
     * @param boolean $link if true, root url is not prepended
     * @return null
     */
    public static function q_css($css, $options = array()) {
	if (isset($_GET["xhr"])) {
	    return;
	}
	if (!isset(self::$css[$css])) {
	    self::$css[$css] = $options;
	    //fs_Debug::log("Queueing CSS File", TRACE, $css);
	}
	self::$css[$css] = $options;
    }

    /**
     * queue an ajax function call for ajax requests
     *
     * @param string $action name of the 'action' used in the ajax call
     * @param string $func function to execute upon request
     */
    public static function q_xhr($action, $func) {
	if (!isset(self::$xhr[$action])) {
	    self::$xhr[$action] = $func;
	    //fs_Debug::log('Adding Ajax Action', TRACE, $action . ': ' . $func . '()');
	}
    }

    private static function load() {

    }

    private static function process() {

    }

    private static function get_body() {
	if (fs_User::fb_login() && isset($_GET["code"])) {
	    header('Location: ' . ROOT_URL);
	    die();
	}
	?>
	<div class='page-wrapper'>
	    <?php
	    if (!fs_User::isLoggedIn()) {
		self::q_js("fs_UserLogin");
		self::q_css("fs_UserLogin");
		echo fs_User::get_login();
	    } else {
		self::q_js("fs_User");

		self::q_css("fs_Main");
		self::q_js("fs_Main");

		self::q_js("fs_Button");
		self::q_css("fs_Button");

		self::q_js("fs_TopBar");
		self::q_js("fs_BottomBar");
		self::q_js("fs_LeftBar");
		self::q_js("fs_RightBar");

		self::q_js("vendor/PerspectiveTransform.min");

		self::q_js("fs_Model");
		self::q_js("fs_Time");

		self::q_css("fs_Panel");
		self::q_js("fs_Panel");

		self::q_css("fs_Cube");
		self::q_js("fs_Cube");

		self::q_css("fs_Cylinder");
		self::q_js("fs_Cylinder");

		self::q_js("fs_Sphere");
		self::q_css("fs_Sphere");

		self::q_css("fs_List");
		self::q_js("fs_ListItem");
		self::q_js("fs_List");
		self::q_js("fs_TypeTable");

		self::q_css("fs_Character");
		self::q_js("fs_Character");

		self::q_css("fs_Universe");
		self::q_js("fs_Universe");

		self::q_css("fs_Celestial_Object");
		self::q_js("fs_Celestial_Object");

		self::q_css("fs_Satellite");
		self::q_js("fs_Satellite");

		self::q_css("fs_Platform");
		self::q_js("fs_Platform");


		self::q_css("fs_Building");
		self::q_js("fs_Building");

//		if (isset($_GET['builder'])) {
		self::q_css("fs_Builder");
		//self::q_js("fs_Builder");
//		}
	    }
	    ?>
	</div>
	<?php
	self::q_js(ROOT_URL . 'index.php?xhr=true&js=true');
    }

    private static function get_footer() {
	$out = '';

	return $out;
    }

    /**
     * Output response based on incomming request
     *
     */
    private static function end() {
	fs_Debug::log("Compiling Output");
	if (isset($_GET["js"])) {
	    header('Content-Type: text/javascript');
	    include_once(DOCUMENT_ROOT . '/js/fs_Dynamic.php');
	} else if (isset($_GET["css"])) {
	    header('Content-Type: text/css');
	    //echo "/* Compiled:\n" . fs_Debug::out(true) . " */\r\n";
	    echo fs_Scss::load($_GET['css']);
	} else if (isset($_GET["xhr"])) {
	    $found = false;
	    $_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
	    $_GET = filter_input_array(INPUT_GET, FILTER_SANITIZE_STRING);
	    $a = $_POST;
	    unset($_POST["action"]);
	    if (empty($a)) {
		$a = $_GET;
	    }
	    foreach (self::$xhr as $action => $func) {
		if ($a["action"] == $action) {
		    $found = true;
		    call_user_func($func);
		}
	    }
	    if (!$found) {
		self::$out["error"] = "Route Not Found";
	    }
	    fs_Mail::send_mail_queue();
	    self::$out["DEBUG"] = fs_Debug::out(true);
	    header('Content-Type: application/json');
	    cleanArray(self::$out, SANATIZE);
	    echo json_encode(self::$out);
	} else {

	    ob_start();
	    echo self::get_body();
	    $body = ob_get_clean();

	    ob_start();
	    echo self::get_footer();
	    $footer = ob_get_clean();

	    if (fs_User::isLoggedIn()) {
		self::q_js("fs_Main");
	    }

	    ob_start();
	    echo self::get_header();
	    $header = ob_get_clean();
	    ?><!DOCTYPE html>
	    <!--[if lt IE 7 ]><html class="ie ie6" lang="en"> <![endif]-->
	    <!--[if IE 7 ]><html class="ie ie7" lang="en"> <![endif]-->
	    <!--[if IE 8 ]><html class="ie ie8" lang="en"> <![endif]-->
	    <!--[if IE 9 ]><html class="ie ie9" lang="en"> <![endif]-->
	    <!--[if (gte IE 9)|!(IE)]><!--><html> <!--<![endif]-->
	        <head>
		    <?= $header ?>
	        </head>
	        <body>
		    <?= $body ?>
	    	<footer>
			<?= $footer ?>
	    	</footer>
		    <?php fs_Mail::send_mail_queue(); ?>
		    <?= fs_Debug::out(true) ?>
	        </body>
	    </html><?php
	}
    }

}
