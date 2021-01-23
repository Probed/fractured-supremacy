<?php
require_once("../../../../wp-load.php");
header('Content: text/javascript');
$out = array(
    "title" => CONFIG["title"],
    "version" => CONFIG["version"],
    "root_url" => ROOT_URL,
    "ajax_url" => ROOT_URL . '/index.php?xhr=true',
	//"debug" => fs_Debug::out()
);
?>
jQuery.noConflict();

var DEBUG = true;
var CONFIG = <?= json_encode($out) ?>;
var TYPES = <?= json_encode(fs_TypeTable::allTypes()) ?>;
window.addEvent('domready', function() {
<?php include(plugin_dir_path(__FILE__) . 'admin.js'); ?>
});
