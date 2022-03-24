<?php

define('SATELLITE_TABLE', '`satellite`');
define('SATELLITE_PREFIX', 's');
define('SATELLITE_TABLE_SEL', SATELLITE_TABLE . ' ' . SATELLITE_TABLE);

fs_Main::q_xhr('addPlatform', "fs_Satellite::addPlatform");

class fs_Satellite extends fs_TypeTable {

    const type_table = 'satellite_type';
    const table = 'satellite';

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

    public static function addPlatform() {
	$validate = array();

	if (!fs_User::isLoggedIn()) {
	    error('Not Logged In');
	    return false;
	}


	$sat_id = $_POST["sat_id"];
	$x = $_POST["x"] * 1;
	$y = $_POST["y"] * 1;
	$plat_type_id = $_POST["plat_type_id"];

	if (!is_numeric($sat_id)) {
	    fs_Main::q_response("error", 'Empty Satellite ID');
	    return false;
	}
	if (!is_numeric($plat_type_id)) {
	    fs_Main::q_response("error", 'Empty Platform Type ID');
	    return false;
	}
	if (!is_numeric($x)) {
	    fs_Main::q_response("error", 'Empty Platform Position X');
	    return false;
	}
	if (!is_numeric($y)) {
	    fs_Main::q_response("error", 'Empty Platform Position Y');
	    return false;
	}

	$char = fs_Character::getByUserID(fs_User::get("id"));
	$char_id = $char['id'];

	/*
	 * Load the Satellite
	 */
	$sat = new fs_Satellite($sat_id, $validate);
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

	/**
	 * Load the Layout for the satalite
	 */
	$model = $sat->getOption("model");
	if (empty($model)) {
	    fs_Main::q_response("error", 'No Model Found.');
	    return false;
	}
	$layout = $model[0]["value"];

	//verify they are allowed to place something at coorids y,x
	$grid = array();
	foreach ($layout as $ly => $row) {
	    $ly = $ly * 1;
	    $grid[$ly] = array();
	    foreach ($row as $lx => $allowed) {
		$lx = $lx * 1;
		//echo "Allowed: $allowed\n";
		$grid[$ly][$lx] = array();
		$grid[$ly][$lx]["allowed"] = $allowed;
	    }
	}
	if (empty($grid[$y])) {
	    fs_Main::q_response("error", 'Position Not Allowed');
	    return false;
	}
	//print_r($grid);
	if (empty($grid[$y][$x]) || $grid[$y][$x]["allowed"] == 'e') {
	    fs_Main::q_response("error", 'Position Not Allowed');
	    return false;
	}

	//load all platforms for this satellie
	$plats = fs_Platform::getAll($sat->row["id"], self::table, fs_Platform::table, $validate);
	if (empty($plats)) {
	    fs_Main::q_response("error", 'No Platforms Found');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}
	foreach ($plats as $index => $plat) {
	    $platform = new fs_Platform($plat, $validate);
	    $pX = $platform->getOption("platformPosition", "x") * 1;
	    $pY = $platform->getOption("platformPosition", "y") * 1;
	    $grid[$pY][$pX]["platform"] = $platform;
	}
	if (!empty($grid[$y][$x]["platform"])) {
	    fs_Main::q_response("error", 'A Platform already exists here.');
	    return false;
	}

	//check there is a platform to connect to
	// a b c
	// d N e
	// f g h
	$a = $y - 1 >= 0 && $y - 1 >= 0 && isset($grid[$y - 1]) && isset($grid[$y - 1][$x - 1]) ? $grid[$y - 1][$x - 1] : null;
	$b = $y - 1 >= 0 && isset($grid[$y - 1]) && isset($grid[$y - 1][$x]) ? $grid[$y - 1][$x] : null;
	$c = $y - 1 >= 0 && isset($grid[$y - 1]) && isset($grid[$y - 1][$x + 1]) ? $grid[$y - 1][$x + 1] : null;
	$d = $grid[$y][$x - 1];
	$e = $grid[$y][$x + 1];
	$f = $grid[$y + 1][$x - 1];
	$g = $grid[$y + 1][$x];
	$h = $grid[$y + 1][$x + 1];
	$connectable = false;
	foreach ([$a, $b, $c, $d, $e, $f, $g, $h] as $p) {
	    if (!empty($p) && isset($p["platform"])) {
		$connectable = true;
	    }
	}
	if (!$connectable) {
	    fs_Main::q_response("error", 'Cannot connect this platform to the main structure.');
	    return false;
	}

	//Get the platform type that is to be built
	$new_plat_type = fs_Table::get($plat_type_id, $validate, fs_Platform::type_table);
	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Invalid Platform Type.');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	$buildReqs = array();
	$buildReq = new buildReq($plat_type_id, fs_Platform::type_table, $buildReqs, $validate);
	if (!$buildReq) {
	    error("You have not met the requirements to build this platform", $buildReqs, $validate);
	    return false;
	}

	$buildCosts = array();
	$buildCost = new buildCost($plat_type_id, fs_Platform::type_table, $buildCosts, $validate);
	if (!$buildCost) {
	    error('You cannot afford to build this platform', $buildCosts, $validate);
	    return false;
	}

	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Validation Error');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	$validate = array();
	$platform_id = fs_Platform::create(array(
		    "satellite_id" => $sat_id,
		    "platform_type_id" => $plat_type_id,
		    "options" => array(
			"platformPosition" => array(
			    "x" => $x,
			    "y" => $y
			)
		    )), $validate);

	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Validation Error');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	fs_Main::q_response("success", 'Platform Added Successfully');
	fs_Main::q_response("platform", fs_Platform::get($platform_id));
	return $platform_id;
    }

}
