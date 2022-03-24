<?php

define('RESOURCE_TABLE', '`resource`');
define('RESOURCE_PREFIX', 'r');
define('RESOURCE_TABLE_SEL', RESOURCE_TABLE . ' ' . RESOURCE_PREFIX);

class fs_Resource extends fs_TypeTable {

    const type_table = 'resource_type';
    const table = 'resource';

    public function __construct($id_or_array, &$validate = array(), $table = self::table, $type_table = self::type_table) {
	parent::__construct($id_or_array, $validate, $table, $type_table);
    }

    public function load($id, &$validate = array(), $table = self::table, $type_table = self::type_table) {
	parent::load($id, $validate, $table, $type_table);
    }

    public static function validate($args, &$validate = array()) {
	validateInteger($validate, "qty", "Quantity", $args["qty"], 0, 999999999999, false);
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

}
