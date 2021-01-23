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

	/*
	 * Load the Satellite
	 */
	$sat = new fs_Satellite($sat_id, $validate);
	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Satellite Validation Error');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	$layout = $sat->getOption("layout");
	if (empty($layout)) {
	    fs_Main::q_response("error", 'No Layout Found');
	    return false;
	}
	//verify they are allowed to place something there
	$grid = array();
	foreach ($layout as $ly => $row) {
	    $ly = $ly * 1;
	    $grid[$ly] = array();
	    $cols = explode(",", $row);
	    foreach ($cols as $lx => $allowed) {
		$lx =$lx*1;
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
	    $pX = $platform->getOption("platformPosition", "x")*1;
	    $pY = $platform->getOption("platformPosition", "y")*1;
	    $grid[$pY][$pX]["platform"] = $platform;
	}
	if (!empty($grid[$y][$x]["platform"])) {
	    fs_Main::q_response("error", 'A Platform already exists there.');
	    return false;
	}

	//Get the platform type that is to be builtr
	$new_plat_type = fs_Table::get($plat_type_id, $validate, fs_Platform::type_table);
	if (hasError($validate)) {
	    fs_Main::q_response("error", 'Invalid Platform Type.');
	    fs_Main::q_response("validate", $validate);
	    return false;
	}

	$platform_id = fs_Platform::create(array(
		    "satellite_id" => $sat_id,
		    "platform_type_id" => $plat_type_id,
		    "options" => array(
			"platformPosition" => array(
			    "x" => $x,
			    "y" => $y
			),
			"level" => 1
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
