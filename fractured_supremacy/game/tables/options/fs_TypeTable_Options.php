<?php

//Parent Class
class fs_TypeTable_Options {

    public $type = null;

    public function __construct($type_id, $type_table, &$results = array(), &$validate = array()) {
	$this->type = fs_Table::get($type_id, $validate, $type_table)[0];
	return $this->process($results);
    }

    public function process(&$results = array()) {
	return "process() function not overridden.";
    }

    public static function ownedByChar($table, $type_id, $validate = array()) {
	$char = fs_Character::getByUserID(fs_User::get("id"));
	//look to see if they have the required type in their universe
	$where = '';
	$whereClose = '';
	$where .= $table . '_type_id' . ' = ' . $type_id;
	$where .= " AND (";
	$where .= "id IN ";
	switch ($table) {
	    case "celestial_object":
		$where .= "(SELECT id FROM " . CELESTIAL_OBJECT_TABLE . " ";
		break;
	    case "satallite":
		$where .= "(SELECT id FROM " . SATELLITE_TABLE . " WHERE id IN ";
		$where .= "(SELECT id FROM " . CELESTIAL_OBJECT_TABLE . " ";
		$whereClose .= ")";
		break;
	    case "platform":
		$where .= "(SELECT id FROM " . PLATFORM_TABLE . " WHERE id IN ";
		$where .= "(SELECT id FROM " . SATELLITE_TABLE . " WHERE id IN ";
		$where .= "(SELECT id FROM " . CELESTIAL_OBJECT_TABLE . " ";
		$whereClose .= "))";
		break;
	    case "building":
		$where .= "(SELECT id FROM " . BUILDING_TABLE . " WHERE id IN ";
		$where .= "(SELECT id FROM " . PLATFORM_TABLE . " WHERE id IN ";
		$where .= "(SELECT id FROM " . SATELLITE_TABLE . " WHERE id IN ";
		$where .= "(SELECT id FROM " . CELESTIAL_OBJECT_TABLE . " ";
		$whereClose .= ")))";
		break;
	    case "inhabitant":
		$where .= "(SELECT id FROM " . INHABITANT_TABLE . " WHERE id IN ";
		$where .= "(SELECT id FROM " . BUILDING_TABLE . " WHERE id IN ";
		$where .= "(SELECT id FROM " . PLATFORM_TABLE . " WHERE id IN ";
		$where .= "(SELECT id FROM " . SATELLITE_TABLE . " WHERE id IN ";
		$where .= "(SELECT id FROM " . CELESTIAL_OBJECT_TABLE . " ";
		$whereClose .= "))))";
		break;

	    default:
		$where .= "(SELECT id FROM " . $table . " ";
		break;
	}
	$where .= " WHERE universe_id IN (SELECT universe_id FROM " . CHARACTER_TABLE . "";
	$where .= " WHERE id = " . $char["id"];
	$where .= ")))" . $whereClose;
//	fs_Debug::log("OwnedByChar", INFO, $where);
	return fs_Table::get([
		    "where" => $where
			], $validate, $table);
    }

}

require_once(DOCUMENT_ROOT . 'game/tables/options/buildReq.php');
require_once(DOCUMENT_ROOT . 'game/tables/options/buildCost.php');
