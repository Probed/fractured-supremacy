<?php

define('UNIVERSE_TABLE', 'universe');
define('UNIVERSE_PREFIX', 'uni');
define('UNIVERSE_TABLE_SEL', UNIVERSE_TABLE . ' ' . UNIVERSE_PREFIX);

class fs_Universe extends fs_Table {

    const table = "universe";

    public function __construct($id_or_array, &$validate = array(), $table = self::table, $type_table = null) {
	parent::__construct($id_or_array, $validate, $table, $type_table);
    }

    protected function load($id, &$validate = array(), $table = self::table, $type_table = NULL) {
	return parent::load($id, $validate, $table, $type_table);
    }

    public static function validate($args, &$validate = array()) {
	validateBasicText($validate, "name", "Univer Name", $args["name"], 2, 50, false);
	validateBasicText($validate, "frequency", "Universe Frequency", $args["name"], 2, 50, false);
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
