<?php

/*
 * Static class for debug logging
 */

class fs_DB {

    public static $mysqli = null;

    public static function connect() {
	if (empty(self::$mysqli)) {
	    fs_Debug::log('Connecting to Database', SQL);
	    self::$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

	    /* check connection */
	    if (self::$mysqli->connect_errno) {
		error('MySQL Connect Failed', self::$mysqli->connect_error);
		self::$mysqli->close();
	    } else {
		fs_Debug::log('Database Connection Successful', SQL);
	    }
	}
    }

    public static function prepare($sql, &$validate = null) {
	self::connect();
	$stmt = self::$mysqli->prepare($sql);
	if (empty($stmt) || self::$mysqli->error) {
	    error("Unable to prepare SQL statement:<br /> " . $sql, self::$mysqli->error, $validate);
	} else {
	    //fs_Debug::log("Statement Prepard", SQL, $sql);
	}
	return $stmt;
    }

    public static function fetch($stmt, &$validate = null) {

	if (empty($stmt)) {
	    error("Attempted to fetch from empty statement.", "", $validate);
	    return null;
	}
	if (!$stmt->execute()) {
	    error("Fetch Error", self::$mysqli->error, $validate);
	}
	self::connect();
	$stmt->store_result();
	$variables = array();
	$data = array();
	$meta = $stmt->result_metadata();
	if (!empty($meta)) {
	    $i = 0;
	    while ($field = $meta->fetch_field()) {
		$variables[$i] = &$data[$field->name]; // pass by reference
		$i++;
	    }

	    call_user_func_array(array($stmt, 'bind_result'), $variables);
	}
	$array = array();
	$i = 0;
	while ($stmt->fetch()) {
	    $array[$i] = array();
	    foreach ($data as $k => $v) {
		$array[$i][$k] = $v;
		if ($k == "options") {
		    $array[$i][$k] = json_decode($v,1);
		}
	    }
	    $i++;
	}

	return $array;
    }

    public static function begin($lonetransaction = true) {
	if (!$lonetransaction) {
	    return;
	}
	self::connect();
	self::$mysqli->begin_transaction();
	fs_Debug::log('Transaction Begun', SQL);
    }

    public static function commit($lonetransaction = true) {
	if (!$lonetransaction) {
	    return;
	}
	self::connect();
	self::$mysqli->commit();
	fs_Debug::log('Transaction Committed.', SQL);
    }

    public static function rollback($lonetransaction = true) {
	if (!$lonetransaction) {
	    return;
	}
	self::connect();
	self::$mysqli->rollback();
	fs_Debug::log('Transaction Rollback', SQL);
    }

    public static function bind_params($stmt, $types, $array) {
	$bind = array();
	$i = 0;
	$bind[$i] = $types;
	foreach ($array as $key => $value) {
	    if ($key != "error" && $key != "submit") {
		$i += 1;
		if ($key == "options" && gettype($array[$key]) == 'array') {
		    $str = json_encode($array[$key]);
		    $bind[$i] = &$str;
		    //fs_Debug::log("Binding Option Parameter", SQL, $array[$key]);
		    $array[$key] = $str;
		} else {
		    $bind[$i] = &$array[$key];
		}
	    }
	}
	//fs_Debug::log("Binding Parameters", SQL, $bind);
	call_user_func_array(array($stmt, 'bind_param'), $bind);
    }

    public static function updateDB_array(&$validate, $updateArr, $table, $where) {

	$types = null;
	$pairs = null;
	$table = explode(" ", $table)[0];

	foreach ($updateArr as $key => $value) {
	    //if ($key != "error" && $key != "submit") {
	    $types .= 's';
	    $pairs .= '`' . $key . '`' . '= ?,';
	    $bind[] = &$value;
	    //}
	}
	$sql = 'UPDATE ' . $table . ' SET ' . substr($pairs, 0, strlen($pairs) - 1) . $where;
	fs_Debug::log("Update to " . $table, SQL, $updateArr);
	$stmt = fs_DB::prepare($sql, $validate);
	if (empty($stmt) || !empty(self::$mysqli->error)) {
	    error("Error updating table '" . $table . "'", self::$mysqli->error, $validate);
	} else {
	    fs_DB::bind_params($stmt, $types, $updateArr);
	    $stmt->execute();
	    if (!empty($stmt->error)) {
		error("Error updating table '" . $table . "'", $stmt->error, $validate);
	    } else {

	    }
	    $stmt->close();
	}
    }

    public static function insertDB_array(&$validate, $insertArr, $table, $ignorecols = array()) {

	$cols = null;
	$vals = null;
	$types = null;
	$table = explode(" ", $table)[0];
	foreach ($insertArr as $key => $value) {
	    if (!in_array($key, $ignorecols)) {
		$cols .= '`' . $key . '`,';
		$vals .= "?,";
		$types .= 's';
	    }
	}
	$sql = 'INSERT INTO ' . $table . ' (' . substr($cols, 0, strlen($cols) - 1) . ') VALUES (' . substr($vals, 0, strlen($vals) - 1) . ')';
	fs_Debug::log("Insert to " . $table, SQL, $insertArr);
	$stmt = fs_DB::prepare($sql, $validate);
	if (empty($stmt) || !empty(self::$mysqli->error)) {
	    error("Error Inserting into table '" . $table . "'", self::$mysqli->error, $validate);
	} else {
	    fs_DB::bind_params($stmt, $types, $insertArr);
	    $stmt->execute();
	    if (!empty($stmt->error)) {
		error("Error Inserting into '" . $table . "'", $stmt->error, $validate);
		$stmt->close();
	    } else {
		$stmt->store_result();
		$id = $stmt->insert_id;
		$stmt->close();
		return $id;
	    }
	}
    }

    public static function deleteFromDB(&$validate, $table, $where = "") {

	$sql = "DELETE FROM " . explode(" ", $table)[0] . ' WHERE 1=1 AND (' . $where . ")";

	$stmt = fs_DB::prepare($sql, $validate);
	$results = fs_DB::fetch($stmt, $validate);

	if (!hasError($validate)) {
	    fs_Debug::log("Delete Success'" . $table . "'", SUCCESS, $where);
	    return true;
	} else {
	    error("Delete Failed: '" . $table . "': ", $where, $validate);
	    return false;
	}
    }

    public static function validateIDExists(&$validate, $table, $column, $id, $andwhere = "") {

	$found = null;
	$exists = false;
	fs_Debug::log("Checking ID Exists: Table: '" . $table . "' Column: '" . $column . "'  Id:" . $id, SQL);
	if (empty($id)) {
	    error("Error Checking ID exists: ID empty.", $id, $validate);
	    return false;
	}

	$sql = "SELECT " . $column . " FROM " . $table . " WHERE " . $column . " = ? " . (!empty($andwhere) ? " AND (" . $andwhere . ")" : "");
	$stmt = fs_DB::prepare($sql, $validate);
	if (empty($stmt) || !empty(self::$mysqli->error)) {
	    error("Error Checking ID exists", self::$mysqli->error, $validate);
	} else {
	    $stmt->bind_param("i", $id);
	    if ($stmt->execute()) {
		$stmt->store_result();
		$stmt->bind_result($found);
		while ($result = $stmt->fetch()) {
		    if ($id == $found) {
			fs_Debug::log("Found ID", SUCCESS, $id);
			$exists = true;
		    }
		}
		$stmt->free_result();
	    } else {
		error("Checking ID Exists: Table: '" . $table . "' Column: '" . $column . "'  Id:" . $id . "", "", $validate);
	    }
	    $stmt->close();
	}
	if (!$exists) {
	    error("ID Does NOT Exist: Table: '" . $table . "' Column: '" . $column . "'  Id:" . $id . "", "", $validate);
	}
	return $exists;
    }

    public static function select($sql, $validate = array()) {
	return fs_DB::fetch(fs_DB::prepare($sql, $validate), $validate);
    }

    public static function select_box($sql, $validate = array()) {
	$rows = fs_DB::fetch(fs_DB::prepare($sql, $validate), $validate);
	if (empty($rows)) {
	    return array();
	}
	$ret = array();
	$ret["0"] = "--Select--";
	foreach ($rows as $key => $value) {
	    $ret[$value["key"]] = $value["value"];
	}
	return $ret;
    }

    public static function close() {
	if (!empty(self::$mysqli)) {
	    self::$mysqli->close();
	    fs_Debug::log('Database Connection Closed', SQL);
	}
    }

}
