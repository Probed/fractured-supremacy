<?php

class fs_Scss {

    public static $vars = array();

    public static function q_var($name, $value) {
	self::$vars[$name] = $value;
    }

    public static function load($sheets) {
	fs_TypeTable::allTypes(); //load all types to queue their scss vars

	$sheets = explode(",", $sheets);
	$comb_scss = '';

	if (!empty(self::$vars)) {
	    $comb_scss .= "\n" . '$vars: (' . "\r\n";
	    foreach (self::$vars as $name => $value) {
		$comb_scss .= "\t" . $name . ",\r\n";
	    }
	    $comb_scss = substr($comb_scss, 0, strlen($comb_scss) - 3);
	    $comb_scss .= "\r\n);\r\n";
	    $comb_scss .= "\n" . '$vals: (' . "\r\n";
	    foreach (self::$vars as $name => $value) {
		$comb_scss .= "\t" . $value . ",\r\n";
	    }
	    $comb_scss = substr($comb_scss, 0, strlen($comb_scss) - 3);
	    $comb_scss .= "\r\n);\r\n";
	}

	foreach ($sheets as $value) {
	    $file = DOCUMENT_ROOT . '/css/' . $value . '.scss';

	    if (file_exists($file)) {
		ob_start();
		include($file);
		$comb_scss .= ob_get_clean();
	    } else {

	    }
	}

	//echo $comb_scss;
	$scss = new scssc();
	try {
	    $out = $scss->compile($comb_scss);
	    return $out;
	} catch (Exception $exc) {
	    echo $comb_scss;
	    echo $exc->getMessage();
	}

	return "";
    }

}
