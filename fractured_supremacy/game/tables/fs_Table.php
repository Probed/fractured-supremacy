<?php

class fs_Table {

    protected $id = null;
    protected $row = array();

    const table = '';
    const type_table = '';

    public function __construct($id_or_array, &$validate = array(), $table = self::table, $type_table = self::type_table) {
	if (gettype($id_or_array) == 'array' && is_numeric($id_or_array["id"])) {

	    $this->id = $id_or_array["id"];
	    $this->row = $id_or_array;
	} else if (is_numeric($id_or_array)) {
	    $this->id = $id_or_array;
	}
	$this->load($this->id, $validate, $table, $type_table);
    }

    /**
     * Load the row with id:$id from $table
     *
     * @param int $id the id for the row being loaded
     * @param array $validate (optional) Array for Storing errors
     * @param string $table table to get the row from
     * @param string $type_table (optional) for type table inheritance
     * @return array key/value row array
     */
    protected function load($id, &$validate = array(), $table = self::table, $type_table = self::type_table) {
	if (!empty($this->row)) {
	    return $this->row;
	}
	//assign the row to the instance;
	$this->row = self::get($id, $validate, $table)[0];
	return $this->row;
    }

    /**
     * called prior to inserting or updating a row
     *
     * @param array $args the array of key/values for the data being  validated
     * @param array $validate the validation array used to store errors;
     * @return boolean did validation pass
     */
    public static function validate($args, &$validate = array()) {
	return true;
    }

    /**
     * Insert a table row with the the $args key/values
     *
     * @param array $args key/vaLue where key is column name
     * @param array $validate (optional) array for validation errors
     * @param string $table the table to insert the row into
     * @return int row id or false if validation failed
     */
    public static function create($args, &$validate = array(), $table = self::table) {
	self::validate($args, $validate);
	if (hasError($validate)) {
	    return false;
	} else {
	    return fs_DB::insertDB_array($validate, $args, $table);
	}
    }

    /**
     * Update a table row with the $args key/vaLues
     *
     * @param array $args key/vaLue where key is column name
     * @param array $validate validation array for errors
     * @param string $table table to update
     * @return int row id or false if validation failed
     */
    public static function update($args, &$validate = array(), $table = self::table) {
	if (empty($args["id"])) {
	    error("Empty ID for Update to " . $table, $validate);
	    return false;
	}
	self::validate($args, $validate);
	if (hasError($validate)) {
	    return false;
	} else {
	    fs_DB::updateDB_array($validate, $args, $table, " WHERE id = " . $args["id"]);
	    return $args["id"];
	}
    }

    /**
     * gets the row from a table with id $args
     *
     * @param int|array when int will assume id. array ["where"=> where statement]
     * @param array $validate
     * @param string $table
     * @return int row id or false if validation failed
     */
    public static function get($args, &$validate = array(), $table = self::table) {
	//print_r($args);
	if (gettype($args) == "array") {
	    $sql = "SELECT * from " . $table . " WHERE " . $args["where"];
	} else {
	    $sql = "SELECT * from " . $table . " WHERE id = " . $args;
	}
	$results = fs_DB::select($sql, $validate);
	if (hasError($validate)) {
	    return false;
	} else {
	    return $results;
	}
    }

}

require_once(DOCUMENT_ROOT . 'game/tables/fs_Character.php');
require_once(DOCUMENT_ROOT . 'game/tables/fs_Universe.php');
