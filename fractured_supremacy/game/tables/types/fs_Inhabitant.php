<?php

define('INHABITANT_TABLE', '`inhabitant`');
define('INHABITANT_PREFIX', 'i');
define('INHABITANT_TABLE_SEL', INHABITANT_TABLE . ' ' . INHABITANT_PREFIX);


class fs_Inhabitant extends fs_TypeTable {

    const type_table = 'inhabitant_type';
    const table = 'inhabitant';

    public function __construct($id, &$validate = array(), $table = self::table, $type_table = self::type_table) {
	if (!empty($id)) {
	    $this->load($id, $validate, $table, $type_table);
	}
	return $this->row;
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
