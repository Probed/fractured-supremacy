<?php

class fs_Options {

    public static function load(&$row, &$validate = array()) {
	if (!empty($row)) {
	    if (gettype($row["options"]) == "string") {
		try {
		    $row["options"] = json_decode($row["options"], true, 10);
		    fs_Debug::log("Options Decoded", TRACE);
		} catch (Exception $ex) {
		    $row["options"] = array();
		    error("Cannot Load Options JSON Decode Error", $ex, $validate);
		}
	    }
	    if (empty($row["options"])) {
		fs_Debug::log("New Option Set", TRACE, $row);
		$row["options"] = array();
	    }
	} else {
	    error("Cannot Load Options", "Null Row", $validate);
	    $row = array("options" => array());
	}
	return $row;
    }

    public static function get(&$row, $key, &$validate = array()) {
	fs_Options::load($row, $validate);
	return $row["options"][$key];
    }

    public static function set(&$row, $key, $value, &$validate = array()) {
	fs_Options::load($row, $validate);
	if ($row["options"][$key] != $value) {
	    $row["options"]["changed"] = true;
	}
	$row["options"][$key] = $value;
    }
    public static function remove(&$row, $key, &$validate = array()) {
	fs_Options::load($row, $validate);
	unset($row["options"][$key]);
    }

}
