<?php

define('PLATFORM_TABLE', '`platform`');
define('PLATFORM_PREFIX', 'p');
define('PLATFORM_TABLE_SEL', PLATFORM_TABLE . ' ' . PLATFORM_PREFIX);

class fs_Platform extends fs_TypeTable {

    public $platform = array();

    const type_table = 'platform_type';
    const table = 'platform';

    public function __construct($id_or_array, &$validate = array(), $table = self::table, $type_table = self::type_table) {
	parent::__construct($id_or_array, $validate, $table, $type_table);
    }

    public function setOption($name, $value, $validate = array(), $table = self::table) {
	parent::setOption($name, $value, $validate, $table);
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
