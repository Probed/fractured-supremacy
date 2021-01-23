<?php

define('DOCUMENT_ROOT', dirname(__DIR__) . '/fractured_supremacy/');

error_reporting(E_ERROR | E_WARNING | E_PARSE);
ini_set('display_errors', 1);

require_once(DOCUMENT_ROOT . 'scssphp/scss.inc.php');
require_once(DOCUMENT_ROOT . '/css/fs_Scss.php');

require_once(DOCUMENT_ROOT . 'game/fs_Config.php');
require_once(DOCUMENT_ROOT . '../wp-config.php');
require_once(DOCUMENT_ROOT . 'game/fs_Global.php');

define('ROOT_URL', url_origin($_SERVER) . '/fs/fractured_supremacy/');
/**
 * Ignore session when loading via wordpress
 */
if (!defined('ABSPATH')) {
    session_start();

    if ($_GET["logout"]) {
	session_destroy();
	header("Location: " . ROOT_URL);
	die();
    }
}

require_once(DOCUMENT_ROOT . 'game/fs_Main.php');
require_once(DOCUMENT_ROOT . 'game/fs_Debug.php');

fs_Debug::log("Starting Game");

require_once(DOCUMENT_ROOT . 'game/fs_Mail.php');
require_once(DOCUMENT_ROOT . 'game/fs_DB.php');
require_once(DOCUMENT_ROOT . 'game/fs_Cipher.php');
require_once(DOCUMENT_ROOT . 'game/fs_Options.php');
require_once(DOCUMENT_ROOT . 'game/tables/fs_Table.php');
require_once(DOCUMENT_ROOT . 'game/tables/types/fs_TypeTable.php');
require_once(DOCUMENT_ROOT . 'game/fs_User.php');
require_once(DOCUMENT_ROOT . 'game/fs_Install.php');