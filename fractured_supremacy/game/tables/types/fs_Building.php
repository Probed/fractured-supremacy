<?php

define('BUILDING_TABLE', '`building`');
define('BUILDING_PREFIX', 'b');
define('BUILDING_TABLE_SEL', BUILDING_TABLE . ' ' . BUILDING_PREFIX);

fs_Main::q_xhr('upgrade_building', "fs_Building::upgradeBuilding");

class fs_Building extends fs_TypeTable {

    const type_table = 'building_type';
    const table = 'building';

    public function __construct($id_or_array, &$validate = array(), $table = self::table, $type_table = self::type_table) {
	parent::__construct($id_or_array, $validate, $table, $type_table);
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

    public static function upgradeBuilding() {
	$validate = array();

	$id = $_POST["id"];
	$table = $_POST["table"];

	if (!is_numeric($id)) {
	    fs_Main::q_response("error", 'Empty ID');
	    return false;
	}

	$building = new fs_Building($id, $validate);
	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Building Validation Error');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	/*
	 * Load the Platform
	 */
	$plat = new fs_Platform($building->row["platform_id"], $validate);
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

	$upTo = $building->getOption("upTo");
	if (empty($upTo)) {
	    fs_Main::q_response("error", 'Building cannot be upgraded');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	$new_building_type_id = $upTo[0]["building"];
	if (gettype($new_building_type_id) == 'array') {
	    $new_building_type_id = $new_building_type_id[0];
	}
	$new_building_type = fs_Table::get($new_building_type_id, $validate, fs_Building::type_table);
	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Invalid Building Type.');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	$buildCosts = array();
	$buildCost = new buildCost($new_building_type_id, fs_Building::type_table, $buildCosts, $validate);
	if (!empty($buildCosts)) {
	    fs_Main::q_response("error", 'You cannot afford build this building');
	    fs_Main::q_response("buildCost", $buildCosts);
	    return false;
	}

	$buildReqs = array();
	$buildReq = new buildReq($new_building_type_id, fs_Building::type_table, $buildReqs, $validate);
	if (!empty($buildReqs)) {
	    fs_Main::q_response("error", 'You have not met the requirements to build this building');
	    fs_Main::q_response("buildReq", $buildReqs);
	    return false;
	}

	$validate = array();
	$building_id = fs_Building::update(array(
		    "id" => $id,
		    "building_type_id" => $new_building_type_id
			), $validate);

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
