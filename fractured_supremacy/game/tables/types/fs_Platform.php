<?php

define('PLATFORM_TABLE', '`platform`');
define('PLATFORM_PREFIX', 'p');
define('PLATFORM_TABLE_SEL', PLATFORM_TABLE . ' ' . PLATFORM_PREFIX);

fs_Main::q_xhr('addBuilding', "fs_Platform::addBuilding");

class fs_Platform extends fs_TypeTable {

    public $platform = array();

    const type_table = 'platform_type';
    const table = 'platform';

    public function __construct($id_or_array, &$validate = array(), $table = self::table, $type_table = self::type_table) {
	parent::__construct($id_or_array, $validate, $table, $type_table);
    }

    public function setOption($name, $value, $validate = array(), $table = self::table) {
	parent::setOption($name, $value, $validate, $table);
    }

    protected function load($id, &$validate = array(), $table = self::table, $type_table = self::type_table) {
	return parent::load($id, $validate, $table, $type_table);
    }

    public static function validate($args, &$validate = array()) {
	parent::validate($args, $validate);
    }

    public static function create($args, &$validate = array(), $table = self::table) {
	return parent::create($args, $validate, $table);
    }

    public static function update($args, &$validate = array(), $table = self::table) {
	return parent::update($args, $validate, $table);
    }

    public static function get($args, &$validate = array(), $table = self::table) {
	return parent::get($args, $validate, $table);
    }

    public static function addBuilding() {
	$validate = array();

	if (!fs_User::isLoggedIn()) {
	    error('Not Logged In');
	    fs_Main::q_response("error", 'Not Logged In');
	    fs_Main::q_response("login", false);
	    return false;
	}

	$plat_id = $_POST["plat_id"];
	$mount = $_POST["mount"];
	$building_type_id = $_POST["building_type_id"];

	if (!is_numeric($plat_id)) {
	    fs_Main::q_response("error", 'Empty Platform ID');
	    return false;
	}
	if (empty($mount)) {
	    fs_Main::q_response("error", 'Empty Mount Point');
	    return false;
	}
	if (!is_numeric($building_type_id)) {
	    fs_Main::q_response("error", 'Empty Building Type ID');
	    return false;
	}

	/*
	 * Load the Platform
	 */
	$plat = new fs_Platform($plat_id, $validate);
	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Platform Validation Error');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	$char = fs_Character::getByUserID(fs_User::get("id"));
	$char_id = $char['id'];

	/*
	 * Load the Satellite
	 */
	$sat = new fs_Satellite($plat->row["satellite_id"], $validate);
	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Satellite Validation Error');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	/*
	 * Load the Celestial Object
	 */
	$co = new fs_Celestial_Object($sat->row["celestial_object_id"], $validate);
	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Celestial Object Validation Error');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	/*
	 * Load the Universe
	 */
	$uni = new fs_Universe($co->row["universe_id"], $validate);
	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Universe Validation Error');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	/**
	 * Ensure the satellite is owned by the character making the request
	 */
	if ($char_id != $uni->row["character_id"]) {
	    fs_Main::q_response("error", 'You do not belong to that universe!');
	    return false;
	}


	$mountFound = false;
	$mounts = $plat->getOption("mounts");
	foreach ($mounts as $idx => $m) {
	    if ($m["mount"] == $mount) {
		$mountFound = true;
	    }
	}

	if (!$mountFound) {
	    fs_Main::q_response("error", 'Platform does not have the requested mount point.');
	    return false;
	}

	$mountUsed = false;
	//load all buildings on this platform
	$buildings = fs_Building::getAll($plat->row["id"], self::table, fs_Building::table, $validate);
	if (!empty($buildings)) {
	    foreach ($buildings as $idx => $b) {
		$building = new fs_Building($b["id"], $validate);
		if ($mount == $building->getOption("mount")) {
		    $mountUsed = true;
		}
	    }
	}

	if ($mountUsed) {
	    fs_Main::q_response("error", 'The requested mount point is already in use.');
	    return false;
	}

	$new_building_type = fs_Table::get($building_type_id, $validate, fs_Building::type_table);
	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Invalid Building Type.');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	$buildCosts = array();
	$buildCost = new buildCost($building_type_id, fs_Building::type_table, $buildCosts, $validate);
	if (!empty($buildCosts)) {
	    fs_Main::q_response("error", 'You cannot afford build this building');
	    fs_Main::q_response("buildCost", $buildCosts);
	    return false;
	}

	$buildReqs = array();
	$buildReq = new buildReq($building_type_id, fs_Building::type_table, $buildReqs, $validate);
	if (!empty($buildReqs)) {
	    fs_Main::q_response("error", 'You have not met the requirements to build this building');
	    fs_Main::q_response("buildReq", $buildReqs);
	    return false;
	}

	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Validation Error');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	$validate = array();
	$building_id = fs_Building::create(array(
		    "platform_id" => $plat_id,
		    "building_type_id" => $building_type_id,
		    "name" => $new_building_type[0]["name"],
		    "options" => array(
			"mount" => $mount
		    )), $validate);

	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Validation Error');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	fs_Main::q_response("success", 'Building Added Successfully');
	fs_Main::q_response("building", fs_Building::get($building_id)[0]);
	return $building_id;
    }

}
