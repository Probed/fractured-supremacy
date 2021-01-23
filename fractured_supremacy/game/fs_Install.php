<?php

class fs_Install {

    public static function run_scripts() {
	fs_DB::connect();
	$ret = array();
	$files = array();
	$types = array();

	fs_Debug::log("Starting Install", TRACE);
	if ($handle = opendir('./install')) {
	    while (false !== ($entry = readdir($handle))) {
		if ($entry != "." && $entry != ".." && strstr($entry, 'sql')) {
		    array_push($files, $entry);
		}
		if ($entry != "." && $entry != ".." && strstr($entry, 'json')) {
		    array_push($types, $entry);
		}
	    }
	    closedir($handle);
	    sort($files);
	    sort($types);
	    foreach ($files as $file) {
		$script = preg_replace("/[\n\r]/", "", file_get_contents(DOCUMENT_ROOT . "install/" . $file));
		$script = trim(preg_replace("/;/", "; ", $script));
//		fs_Debug::log($file, TRACE, $script);
		mysqli_query(fs_DB::$mysqli, "SET FOREIGN_KEY_CHECKS=0");
		if (mysqli_multi_query(fs_DB::$mysqli, $script)) {
		    do {
			if ($result = mysqli_store_result(fs_DB::$mysqli)) {
			    @mysqli_free_result($result);
			}
		    } while (mysqli_next_result(fs_DB::$mysqli));
		}
		fs_Debug::log($file, SQL);
		if (fs_DB::$mysqli->error) {
		    error("Error Running Script", fs_DB::$mysqli->error);
		}
		mysqli_query(fs_DB::$mysqli, "SET FOREIGN_KEY_CHECKS=1");
	    }
	}


	foreach ($types as $typeFile) {
	    $table = explode("-", $typeFile);

	    if (!empty($table[1])) {
		$table = str_replace(".json", "", $table[1]);
		$file = json_decode(file_get_contents(DOCUMENT_ROOT . 'install/' . $typeFile), true);
		$validate = array();
		if (empty($file)) {
		    continue;
		}
		foreach ($file as $index => $type) {
		    if ($index === 0) {
			continue;
		    }
		    fs_DB::insertDB_array($validate, $type, $table . "_type");
		}
	    }
	}

	fs_Debug::log("Install Complete", SQL);
	return $ret;
    }

}
