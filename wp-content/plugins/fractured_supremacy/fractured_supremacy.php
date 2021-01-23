<?php
/*
  Plugin Name: Fractured Supremacy Administration
  Plugin URI:
  Description: Game Admistration
  Version: 0.1
  Author: Slandstudios
  Author URI: https://slandstudios.com/
  License: GPL2
  Text Domain: fs
  Domain Path: /languages/
 */

if (!defined('ABSPATH'))
    exit;

ini_set('dislay_errors', 1);

if (is_admin()) {
    add_action('admin_menu', 'fs_Admin::admin');
    add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'fs_Admin::action_links');
}

define('GAME_DIR', plugin_dir_path(__FILE__) . '../../../fractured_supremacy/');
require_once(GAME_DIR . 'load.php');
ob_start();
fs_Main::main(true);
ob_end_clean();

class fs_Admin {

    private static $instance = null;
    public static $option_tree = array();

    public static function get_instance() {
	if (is_null(self::$instance)) {
	    self::$instance = new self;
	}
	return self::$instance;
    }

    function __construct() {
	wp_register_script('fs_TypeOptionsBuilder', plugins_url('/js/options/fs_TypeOptionsBuilder.js', __FILE__), null, filemtime(plugin_dir_path(__FILE__) . 'js/options/fs_TypeOptionsBuilder.js'));
	wp_register_script('fs_ModelBuilder', plugins_url('/js/options/fs_ModelBuilder.js', __FILE__), null, filemtime(plugin_dir_path(__FILE__) . 'js/options/fs_ModelBuilder.js'));
	wp_register_script('fs_LayoutBuilder', plugins_url('/js/options/fs_LayoutBuilder.js', __FILE__), null, filemtime(plugin_dir_path(__FILE__) . 'js/options/fs_LayoutBuilder.js'));
	wp_register_script('fs_ProduceBuilder', plugins_url('/js/options/fs_ProduceBuilder.js', __FILE__), null, filemtime(plugin_dir_path(__FILE__) . 'js/options/fs_ProduceBuilder.js'));
	wp_register_script('fs_ResourcePath', plugins_url('/js/options/fs_ResourcePath.js', __FILE__), null, filemtime(plugin_dir_path(__FILE__) . 'js/options/fs_ResourcePath.js'));
	wp_register_script('fs_NewCharacterBuilder', plugins_url('/js/options/fs_NewCharacterBuilder.js', __FILE__), null, filemtime(plugin_dir_path(__FILE__) . 'js/options/fs_NewCharacterBuilder.js'));

	add_action('wp_ajax_update_options', 'fs_Admin::update_options');
	add_action('wp_ajax_update_newuser', 'fs_Admin::update_newuser');
    }

    public static function enqueue_styles() {

    }

    public static function enqueue_admin_styles() {
	//admin css in GAME_DIR/css/admin.scss
    }

    public static function admin() {


	add_action('wp_enqueue_scripts', 'fs_Admin::enqueue_admin_styles');

	wp_enqueue_style('fs_Game_css', str_replace('fs_Reset,', '', fs_Main::getCSS()) . ",admin");
	$js = fs_Main::getJS();
	foreach ($js as $name => $file) {
	    if ($file != 'fs_Dynamic' && $file != ROOT_URL . 'index.php?xhr=true&js=true') {
		wp_enqueue_script($name, $file, array('jquery'));
	    }
	}
	wp_enqueue_script('fs_Admin', plugins_url('/js/admin.php', __FILE__), null, filemtime(plugin_dir_path(__FILE__) . 'js/admin.js'));

	/**
	 * Add Main Menu Link and subpages (types)
	 */
	add_menu_page("Fractured Supremacy", "Fractured Supremacy", 'manage_options', 'fs-dashboard', 'fs_Admin::dashboard_admin_page', 'dashicons-welcome-widgets-menus');
	add_submenu_page('fs-dashboard', 'Table Options Builder', 'Table Options Builder', 'manage_options', 'fs-optionsBuilder', 'fs_Admin::optionsBuilder_admin_page');
	add_submenu_page('fs-dashboard', 'New Character Builder', 'New Character Builder', 'manage_options', 'fs-users', 'fs_Admin::newCharacterBuilder_admin_page');

	wp_enqueue_script('fs_TypeOptionsBuilder');
	wp_enqueue_script('fs_ModelBuilder');
	wp_enqueue_script('fs_LayoutBuilder');
	wp_enqueue_script('fs_ProduceBuilder');
	wp_enqueue_script('fs_NewCharacterBuilder');
	wp_enqueue_script('fs_ResourcePath');

    }

    public static function action_links($links) {
	$links[] = '<a href="' . esc_url(get_admin_url(null, 'admin.php?page=fs-dashboard')) . '">Settings</a>';
	return $links;
    }

    public static function dashboard_admin_page() {
	?>
	<h1>Dashboard</h1>
	<?php
    }

    public static function optionsBuilder_admin_page() {
	$types = fs_TypeTable::loadAllTypeFiles();
	$opts = array(
	    "ajaxurl" => site_url() . '/wp-admin/admin-ajax.php',
	    "types" => $types,
	    "optionsTree" => self::build_option_tree(),
	    "availableOptions" => json_decode(file_get_contents(plugin_dir_path(__FILE__) . "js/options/options.json"), 1),
	    "saved" => @json_decode(file_get_contents(plugin_dir_path(__FILE__) . "js/options/saved.json"), 1)
	);
	$images = array();
	foreach ($types as $tbl => $typs) {
	    $images[$tbl] = fs_TypeTable::getTypeImages($tbl);
	}
	$opts["images"] = $images;
	?>
	<div id="optionbuilder"></div>
	<script type="text/javascript">
	    if (typeof fs_TypeOptionsBuilder != 'undefined') {
		var OPT = new fs_TypeOptionsBuilder(<?= json_encode($opts) ?>);
	    }
	</script>
	<?php
    }

    public static function newCharacterBuilder_admin_page() {
	$types = fs_TypeTable::loadAllTypeFiles();
	$opts = array(
	    "ajaxurl" => site_url() . '/wp-admin/admin-ajax.php',
	    "types" => $types,
	    "newchar" => json_decode(file_get_contents(GAME_DIR . "game/tables/newCharacter.json"), 1),
	    "availableOptions" => json_decode(file_get_contents(plugin_dir_path(__FILE__) . "js/options/options.json"), 1)
	);
	?>
	<h1>New Character Builder</h1>
	<div id="newCharacterBuilder"></div>
	<script type="text/javascript">
	    if (typeof newCharacterBuilder != 'undefined') {
		var NUB = new newCharacterBuilder(<?= json_encode($opts) ?>);
	    }
	</script>
	<?php
    }

    public static function build_option_tree() {
	if (self::$option_tree) {
	    return self::$option_tree;
	}
	$opts = array();

	if ($handle = opendir(plugin_dir_path(__FILE__) . "js/options/option")) {
	    while (false !== ($entry = readdir($handle))) {
		if ($entry != "." && $entry != "..") {
		    $opts[basename($entry, ".json")] = json_decode(file_get_contents(plugin_dir_path(__FILE__) . "js/options/option/" . $entry), 1);
		}
	    }
	    closedir($handle);
	    //print_r($opts);
	}
	ksort($opts);
	self::$option_tree = $opts;
	return self::$option_tree;
    }

    public static function update_options() {
	header('Content-Type: application/json');

	$opts = json_decode(html_entity_decode(stripslashes($_POST['options'])), 1);
	//echo json_last_error();
	// echo html_entity_decode(stripslashes ($_POST['options']));
	$opts = array_remove_empty($opts);

	if (!empty($opts["availableOptions"])) {
	    file_put_contents(plugin_dir_path(__FILE__) . "js/options/options.json", json_encode($opts["availableOptions"]));
	}
	if (!empty($opts["saved"])) {
	    file_put_contents(plugin_dir_path(__FILE__) . "js/options/saved.json", json_encode($opts["saved"]));
	}
	fs_TypeTable::saveAllTypeFiles($opts["types"]);
	//echo "Opts: ";
	//print_r($opts);

	die();
    }

    public static function update_newuser() {
	header('Content-Type: application/json');

	$newchar = json_decode(html_entity_decode(stripslashes($_POST['newchar'])), 1);
	//$newchar = array_remove_empty($newchar);

	if (!empty($newchar)) {
	    file_put_contents(GAME_DIR . "game/tables/newCharacter.json", json_encode($newchar));
	}

	die();
    }

}

fs_Admin::get_instance();
