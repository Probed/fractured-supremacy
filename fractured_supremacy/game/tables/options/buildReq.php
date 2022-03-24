<?php

class buildReq extends fs_TypeTable_Options {

    public function __construct($type_id, $type_table, &$results = array(), &$validate = array()) {
	parent::__construct($type_id, $type_table, $results, $validate);
    }

    public function process(&$results = array()) {
	$passed = true;
	//print_r($this->type);
	if (!isset($this->type["options"]["buildReq"])) {
	    return $passed;
	}
	$buildRequirements = $this->type["options"]["buildReq"];
	if (empty($buildRequirements)) {
	    return $passed;
	}
	foreach ($buildRequirements as $buildReq) {
	    foreach ($buildReq as $table => $type_ids) {
		if ($table == "id")
		    continue;
		//$key == table (building/resource/etc) $value == list of type_ids
		foreach ($type_ids as $type_id) {
		    if (empty(self::ownedByChar($table,$type_id))) {
			//get the type they need
			$type = fs_Table::get($type_id, $validate, $table . '_type')[0];
			if (!isset($results[$table])) {
			    $results[$table] = array();
			}
			$results[$table][] = $type;
			$passed = false;
		    }
		}
	    }
	}
	return $passed;
    }

}
