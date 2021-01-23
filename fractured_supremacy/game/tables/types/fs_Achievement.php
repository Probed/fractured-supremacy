<?php

define('ACHIEVEMENT_TABLE', '`achievement`');
define('ACHIEVEMENT_PREFIX', 'a');
define('ACHIEVEMENT_TABLE_SEL', ACHIEVEMENT_TABLE . ' ' . ACHIEVEMENT_PREFIX);


class fs_Achievement extends fs_TypeTable {

    const type_table = 'achievement_type';
    const table = 'achievement';

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
