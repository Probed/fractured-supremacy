<?php

class buildCost extends fs_TypeTable_Options {

    public function __construct($type_id, $type_table, &$results = array(), &$validate = array()) {
	parent::__construct($type_id, $type_table, $results, $validate);
    }

    public function process(&$results = array()) {
	$char = fs_Character::getByUserID(fs_User::get("id"));
	$passed = true;
	if (!isset($this->type["options"]["buildCost"])) {
	    return $passed;
	}
	$buildCosts = $this->type["options"]["buildCost"];
	if (empty($buildCosts)) {
	    return $passed;
	}
	foreach ($buildCosts as $buildCost) {
	    $optType = array_key_first($buildCost);
	    switch ($optType) {
		case "time":
		    $id = $buildCost["time"];
		    $duration = $buildCost["duration"];
		    break;
		case "id":
		    $id = $buildCost["id"];
		    unset($buildCost["id"]);

		    $qty = $buildCost["qty"];
		    unset($buildCost["qty"]);

		    $table = array_key_first($buildCost);
		    $type_id = $buildCost[$table][0];
		    $owned = self::ownedByChar($table, $type_id);
		    if (empty($owned) || !empty($owned) && $qty * 1 > $owned[0]["qty"] * 1) {
			$qty2 = $qty * 1;
			if (!empty($owned) && $qty * 1 > $owned[0]["qty"]) {
			    $qty2 = $qty - $owned[0]["qty"];
			}
			//get the type they need
			$type = fs_Table::get($type_id, $validate, $table . '_type')[0];
			$type["qty"] = $qty2;
			if (!isset($results[$table])) {
			    $results[$table] = array();
			}
			$results[$table][] = $type;
			$passed = false;
		    }
		    break;
	    }
	}
	return $passed;
    }

}
