<?php

/*
 * Static class for debug logging
 */
define('INFO', 'info');
define('ERROR', 'error');
define('TRACE', 'trace');
define('SUCCESS', 'success');
define('SQL', 'sql');

class fs_Debug {

    private static $log = array();
    public static $pause = false;

    public static function log($title, $level = INFO, $mixed = null) {
	if (!self::$pause) {
	    array_push(self::$log, array(
		'time' => microtime(true),
		'level' => $level,
		'title' => $title,
		'value' => $mixed
	    ));
	}
    }

    public static function out($html = false) {
	fs_Debug::log("Finished - Sending Output");
	if ($html) {
	    $out = '<table cellspacing="0" cellpadding="0" class="fs_Debug-table">';
	    $lvls = array();
	    foreach (self::$log as $idx => $entry) {
		$out .= '<tr class="fs_Debug-line ' . $entry["level"] . ' ' . gettype($entry["value"]) . '">' . "\r\n";
		if (!isset($lvls[$entry["level"]])) {
		    $lvls[$entry["level"]] = 0;
		}
		$lvls[$entry["level"]] += 1;
		foreach ($entry as $key => $value) {
		    $out .= "\t" . '<td class="' . $key . '">' . "";
		    switch (gettype($value)) {
			case 'string':
			    $out .= $value;
			    break;

			case 'object':
			    $out .= print_r($value, 1);
			    break;

			case 'function':
			    $out .= $value;
			    break;

			case 'array':
			    $out .= pp($value);
			    break;

			default:
			    $out .= $value;
			    break;
		    }
		    $out .= '</td>' . "\r\n";
		}
		$out .= '</tr>' . "\r\n";
	    }
	    $out .= '</table>';
	    $lvls_out = '';
	    $lvls_out .= '<ul class="fs_Debug-menu">' . "\r\n";
	    foreach ($lvls as $lvl => $count) {
		$lvls_out .= '<li class="fs_Debug-menu-item ' . $lvl . '">' . "\r\n";
		$lvls_out .= '	<a href="javascript:;" data-dlevel="' . $lvl . '">' . "\r\n";
		$lvls_out .= '	  <span class="level">' . $lvl . '</span>' . "\r\n";
		$lvls_out .= '	  <span class="count">' . $count . 'x</span> ' . "\r\n";
		$lvls_out .= '	</a>' . "\r\n";
		$lvls_out .= '</li>' . "\r\n";
	    }
	    $lvls_out .= '</ul>' . "\r\n";
	    $out = '<div  class="fs_Debug-wrapper">'
		    . $lvls_out
		    . $out
		    . '</div>' . "\r\n";

	    return $out;
	} else {
	    return self::$log;
	}
    }

}
