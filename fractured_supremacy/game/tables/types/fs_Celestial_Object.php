<?php

define('CELESTIAL_OBJECT_TABLE', '`celestial_object`');
define('CELESTIAL_OBJECT_PREFIX', 'co');
define('CELESTIAL_OBJECT_TABLE_SEL', CELESTIAL_OBJECT_TABLE . ' ' . CELESTIAL_OBJECT_PREFIX);

class fs_Celestial_Object extends fs_TypeTable {

    const type_table = 'celestial_object_type';
    const table = 'celestial_object';

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

}
