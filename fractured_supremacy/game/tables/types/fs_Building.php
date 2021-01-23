<?php

define('BUILDING_TABLE', '`building`');
define('BUILDING_PREFIX', 'b');
define('BUILDING_TABLE_SEL', BUILDING_TABLE . ' ' . BUILDING_PREFIX);


class fs_Building extends fs_TypeTable {

    const type_table = 'building_type';
    const table = 'building';

    public function __construct($id, &$validate = array(), $table = self::table, $type_table = self::type_table) {
	if (!empty($id)) {
	    $this->load($id, $validate, $table, $type_table);
	}
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
}
