<?php

class fs_TypeTable extends fs_Table {

    protected static $types = array();
    protected static $type_files = array();
    public $type = array();
    private $options = array(); //a merged array of the type options with the object options. do not save this as the object options, instead use $this->row["options"]

    const type_table = '';
    const table = '';

    public function __construct($id_or_array, &$validate = array(), $table = self::table, $type_table = self::type_table) {
	parent::__construct($id_or_array, $validate, $table, $type_table);
    }

    /**
     * Overrides fs_Table load
     * retrieves the contents of the row for $id and it's type from the type table and applys it's options
     *
     * @param int $id the id of the row
     * @param array $validate the validation array
     * @param string $table the table name to get the row from (defaults to self::table)
     * @param string $type_table the name of the type table (defaults to self::type_table)
     * @return type
     */
    protected function load($id, &$validate = array(), $table = self::table, $type_table = self::type_table) {
	//load the primary $row
	parent::load($id, $validate, $table, $type_table);

	//load and cache the type
	if (!isset(self::$types)) {
	    self::$types = array();
	}
	if (!isset(self::$types[$table])) {
	    self::$types[$table] = array();
	}
	if (!isset(self::$types[$table][$id])) {
	    self::$types[$table][$id] = parent::get(["where" => "id = " . $this->row[$type_table . "_id"]], $validate, $type_table)[0];
	}

	//assign $type to instance
	$this->type = self::$types[$table][$id];
	$this->loadOptions();
	return self::$types[$table][$id];
    }

    /**
     * Sets $this->options merging the Type options with $this->options
     *
     */
    private function loadOptions() {
	if (empty($this->row["options"])) {
	    $this->row["options"] = array();
	}
	$opts = array_merge($this->type["options"], $this->row["options"]);
	$this->options = $opts;
    }

    /**
     * returns an option from the merged options array: $this->options
     *
     * @param string $name option key name
     * @param string $sub if the above is an array this will get the sub item
     * @return mixed value of option
     */
    public function getOption($name, $sub = null) {
	$return = $this->options[$name];
	if (!empty($sub) && gettype($return) == 'array') {
	    $return = $return[$sub];
	}
	return $return;
    }

    /**
     * sets and saves the option to the db
     *
     * @param type $name option name
     * @param type $value option value
     * @param type $validate array for validation errors
     * @param type $table the table the row belongs to (defaults to self::table)
     */
    public function setOption($name, $value, $validate = array(), $table = self::table) {
	$this->row["options"][$name] = $value;
	self::update($this->row, $validate, $table);
    }

    public static function create($args, &$validate = array(), $table = self::table) {
	return parent::create($args, $validate, $table);
    }

    public static function update($args, &$validate = array(), $table = self::table) {
	return parent::update($args, $validate, $table);
    }

    public static function typeHierarchy($rows) {
	$hier = array();

	if (gettype($rows) == 'array') {
	    foreach ($rows as $index => $row) {
		if (empty($hier[$row["type"]])) {
		    $hier[$row["type"]] = array();
		}

		if (empty($hier[$row["type"]][$row["category"]])) {
		    $hier[$row["type"]][$row["category"]] = array();
		}
		if (empty($hier[$row["type"]][$row["category"]][$row["subcat"]])) {
		    $hier[$row["type"]][$row["category"]][$row["subcat"]] = array();
		}
		array_push($hier[$row["type"]][$row["category"]][$row["subcat"]], $row);
	    }
	}
	return $hier;
    }

    /**
     * builds an array with the different table types
     *
     * @return array
     */
    public static function allTypes() {
	$types = array();
	$parent_tables = [
	    RESOURCE_TABLE,
	    ITEM_TABLE,
	    INHABITANT_TABLE,
	    ACHIEVEMENT_TABLE,
	    CELESTIAL_OBJECT_TABLE,
	    SATELLITE_TABLE,
	    PLATFORM_TABLE,
	    BUILDING_TABLE,
	    EXPEDITION_TABLE,
	    TECHTREE_TABLE
	];
	$v = array();
	foreach ($parent_tables as $parent_table) {
	    $parent_table = str_replace('`', '', $parent_table);
	    $typetable = '`' . $parent_table . '_type`';
	    $t = fs_Table::get(["where" => "1=1"], $v, $typetable);
	    if (empty($types[$parent_table])) {
		$types[$parent_table] = [];
	    }
	    if (gettype($t) == 'array') {
		foreach ($t as $idx => $row) {
		    $css = null;//$row["options"]["css"];
		    if (!empty($css)) {
			if (!empty($css["vars"])) {
			    foreach ($css["vars"] as $key => $value) {
				//fs_Scss::q_var($parent_table . '-' . $css["id"] . '-' . $key, $value);
			    }
			    //unset($row["options"]["css"]["vars"]);
			}
		    }
		    $types[$parent_table][$row["id"]] = $row;
		}
	    }
	}
	self::$types = $types;
	return $types;
    }

    public static function getAll($parent_id, $parent_table, $table, $validate = array()) {
	return self::get([
		    "where" => $parent_table . "_id = " . $parent_id
			], $validate, $table);
    }

    public static function loadAllTypeFiles($fresh = false) {
	$types = array();
	if (!empty(self::$type_files) && !$fresh) {
	    return self::$type_files;
	}

	$cdir = scandir(DOCUMENT_ROOT . '/install');
	foreach ($cdir as $key => $typeFile) {
	    if ($typeFile != "." && $typeFile != ".." && strstr($typeFile, 'json')) {
		$table = explode("-", $typeFile);
		if (!empty($table[1])) {
		    $table = str_replace(".json", "", $table[1]);
		    $types[$table] = json_decode(file_get_contents(DOCUMENT_ROOT . 'install/' . $typeFile), true);
		}
	    }
	}
	self::$type_files = $types;
	return $types;
    }

    public static function saveAllTypeFiles($types) {
	if ($handle = opendir(DOCUMENT_ROOT . '/install')) {
	    while (false !== ($typeFile = readdir($handle))) {
		if ($typeFile != "." && $typeFile != ".." && strstr($typeFile, 'json')) {
		    $table = explode("-", $typeFile);
		    if (!empty($table[1])) {
			$table = str_replace(".json", "", $table[1]);
			if (!empty($types[$table])) {
			    //echo "Writing: $table - $typeFile\n" . json_encode($types[$table]) ."\n";
			    file_put_contents(DOCUMENT_ROOT . 'install/' . $typeFile, json_encode($types[$table]));
			} else {
			    //echo "Writing Empty: $table - $typeFile\n";
			    file_put_contents(DOCUMENT_ROOT . 'install/' . $typeFile, '[{"disabled":true}]');
			}
		    }
		}
	    }
	    closedir($handle);
	}
    }

    public static function getTypeImages($table) {
	$images = array();
	if (file_exists(DOCUMENT_ROOT . 'image/' . $table) && $handle = opendir(DOCUMENT_ROOT . 'image/' . $table)) {
	    while (false !== ($image = readdir($handle))) {
		if ($image != "." && $image != "..") {

		    $images[$image] = array(
			"name" => $image,
			"src" => 'image/' . $table . '/' . $image,
			"size" => getimagesize(DOCUMENT_ROOT . 'image/' . $table . '/' . $image)
		    );
		}
	    }
	    closedir($handle);
	}
	ksort($images);
	return $images;
    }

}

require_once(DOCUMENT_ROOT . 'game/tables/types/fs_Resource.php');
require_once(DOCUMENT_ROOT . 'game/tables/types/fs_Building.php');
require_once(DOCUMENT_ROOT . 'game/tables/types/fs_Platform.php');
require_once(DOCUMENT_ROOT . 'game/tables/types/fs_Satellite.php');
require_once(DOCUMENT_ROOT . 'game/tables/types/fs_Celestial_Object.php');
require_once(DOCUMENT_ROOT . 'game/tables/types/fs_Item.php');
require_once(DOCUMENT_ROOT . 'game/tables/types/fs_Expedition.php');
require_once(DOCUMENT_ROOT . 'game/tables/types/fs_Tech_Tree.php');
require_once(DOCUMENT_ROOT . 'game/tables/types/fs_Achievement.php');
require_once(DOCUMENT_ROOT . 'game/tables/types/fs_Inhabitant.php');
