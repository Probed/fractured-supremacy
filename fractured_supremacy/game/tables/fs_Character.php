<?php

define('CHARACTER_TABLE', 'fs_character');
define('CHARACTER_PREFIX', 'c');
define('CHARACTER_TABLE_SEL', CHARACTER_TABLE . ' ' . CHARACTER_PREFIX);


fs_Main::q_xhr('upload_char_image', "fs_Character::upload_image_ajax");
fs_Main::q_xhr('get_char_image', "fs_Character::get_image_ajax");
fs_Main::q_xhr('update_character', "fs_Character::update_character_ajax");

class fs_Character extends fs_Table {

    const table = 'fs_character';

    private static $character = null;

    public static function validate($args, &$validate = array()) {
	validateBasicText($validate, "name", "Character Name", $args["name"], 3, 16, false);
    }

    public static function update($args, &$validate = array(), $table = self::table) {
	return parent::update($args, $validate, $table);
    }

    public static function get($args, &$validate = array(), $table = self::table) {
	return parent::get($args, $validate, $table);
    }

    public static function getByUserID($id, &$validate = array(), $table = self::table) {
	return self::get(["where" => "user_id in (SELECT id FROM " . USER_TABLE . " WHERE id = " . $id . ')'], $validate, $table)[0];
    }

    public static function update_character() {
	$_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);

	$do = $_POST["do"];
	switch ($do) {
	    case "delete":
		$file = $_POST["file"]; //encoded file name
		$newactive = false;

		$char = self::get_users_active_character($validate);
		$images = fs_Options::get($char, "images");

		if (!empty($images)) {
		    foreach ($images as $idx => $image) {
			if ($images[$idx]["encName"] == $file) {
			    if ($images[$idx]["active"]) {
				$newactive = true;
			    }
			    unset($images[$idx]);
			    unlink(DOCUMENT_ROOT . 'image/character/' . $image["encName"]);
			}
		    }
		}
		if ($newactive && !empty($images)) {
		    foreach ($images as $idx => $image) {
			$images[$idx]["active"] = true;
			break;
		    }
		}
		fs_DB::begin();
		fs_Options::set($char, "images", $images);
		fs_Character::update($char, $validate, self::table);
		fs_DB::commit();
		self::$character = $char;
		fs_Main::q_response("success", true);
		fs_Main::q_response("character", $char);
		break;

	    case "activate":
		$file = $_POST["file"]; //encoded file name

		$char = self::get_users_active_character($validate);
		$images = fs_Options::get($char, "images");

		if (!empty($images)) {
		    foreach ($images as $idx => $image) {
			if ($images[$idx]["encName"] == $file) {
			    $images[$idx]["active"] = true;
			} else {
			    $images[$idx]["active"] = false;
			}
		    }
		}
		fs_DB::begin();
		fs_Options::set($char, "images", $images);
		fs_Character::update($char, $validate, self::table);
		fs_DB::commit();
		self::$character = $char;
		fs_Main::q_response("success", true);
		fs_Main::q_response("character", $char);

		break;

	    case "name" :
		$name = $_POST["name"];
		$validate = array();
		$character = fs_Character::get_users_active_character($validate);
		$args = [
		    "name" => $name,
		    "id" => $character["id"]
		];
		self::validate($args, $validate);
		if (!hasError($validate)) {
		    if ($character["id"]) {
			fs_DB::begin();
			self::update($args, $validate);
			fs_DB::commit();
			self::$character = array_merge($character, $args);
			fs_Main::q_response("character", $character);
			fs_Main::q_response("success", !hasError($validate));
		    } else {
			error("Failed to update character name.", "Could not find character", $validate);
		    }
		}

		fs_Main::q_response("validate", $validate);
		break;

	    default:
		error("Do action not found", $do, $validate);
		break;
	}
    }

    public static function get_users_active_character(&$validate = array()) {
	if (empty(self::$character)) {
	    return self::$character = self::get(["where" => "active = 1 AND user_id in (SELECT id FROM " . USER_TABLE . " WHERE id = " . fs_User::get("id") . ")"], $validate, self::table)[0];
	} else {
	    return self::$character;
	}
    }

    public static function upload_image_ajax() {
	$validate = array();

	fs_Debug::log("Uploading Character Image", TRACE);
	$downloadLinks = "";

	$files = array();
	$char = self::get_users_active_character($validate);
	$images = fs_Options::get($char, "images");
	if (empty($images)) {
	    $images = array();
	}


	$file = $_FILES['image']["tmp_name"];
	fs_Debug::log("Checking File", TRACE, $file);

	if (empty($file)) {
	    error("image", "File Empty", $validate);
	}
	//print_r($_FILES['image']);
	if (!in_array($_FILES['image']["type"], CONFIG["image_types"])) {
	    error("image", "Invalid File type: " . $_FILES['image']["type"], $validate);
	}
	$type = $_FILES['image']["type"];

	$tmpFile = $_FILES['image']["tmp_name"];
	if (!file_exists($tmpFile)) {
	    error("image", "Uploade TMP file not found. Please Try Again.", $validate);
	}

	$name = stripslashes(strip_tags($_FILES['image']["name"]));
	$size = $_FILES['image']["size"];

	$iv = openssl_random_pseudo_bytes(16);

	$cipher = new fs_Cipher($name . AUTH_SALT, $iv);
	$encName = md5($cipher->encrypt($name));

	fs_Debug::log("Moving TMP file to Attachment directory", TRACE);
	if (move_uploaded_file($_FILES['image']["tmp_name"], sprintf(DOCUMENT_ROOT . 'image/character/%s', $encName))) {
	    fs_Debug::log("TMP file moved successfully", TRACE);
	    file_put_contents(sprintf(DOCUMENT_ROOT . 'image/character/%s', $encName), $cipher->encrypt(file_get_contents(sprintf(DOCUMENT_ROOT . 'image/character/%s', $encName))));
	    $img = array(
		'active' => true,
		"iv" => base64_encode($iv),
		"encName" => $encName,
		"name" => $name,
		"size" => $size,
		"type" => $type,
		"created" => date("Y-m-d H:i:s")
	    );
	    array_push($images, $img);
	} else {
	    error("image", "Error Moving Uploaded File", $validate);
	}
	foreach ($images as $idx => $image) {
	    $images[$idx]["active"] = false;
	    if ($images[$idx]["encName"] == $encName) {
		$images[$idx]["active"] = true;
	    }
	}

	if (hasError($validate)) {
	    error("image", "Image Upload Failed", $validate);
	    fs_Main::q_response("success", false);
	    fs_Main::q_response("validate", $validate);
	    return false;
	} else {
	    fs_Options::set($char, "images", $images);
	    fs_DB::begin();
	    fs_Character::update($char, $validate, self::table);
	    fs_DB::commit();
	    self::$character = $char;
	    fs_Main::q_response("success", true);
	    fs_Main::q_response("character", $char);
	    return true;
	}
    }

    public static function get_image_ajax($asArray = false) {
	$_GET = filter_input_array(INPUT_GET, FILTER_SANITIZE_STRING);
	$char = number_or($_GET["character"], 0);
	$img = $_GET["image"];

	if (empty($char) || empty($img)) {

	} else {
	    $validate = array();
	    $char = parent::get(["where" => "id = " . $char], $validate, self::table)[0];
	    $images = fs_Options::get($char, "images");

	    foreach ($images as $i => $image) {
		if ($image["encName"] == $img) {
		    $header = $image["type"];
		    $src = DOCUMENT_ROOT . 'image/character/' . $image["encName"];
		    $imgEnc = file_get_contents($src);
		    $cipher = new fs_Cipher($image["name"] . AUTH_SALT, base64_decode($image["iv"]));
		    $out = $cipher->decrypt($imgEnc);
		}
	    }
	}
	if (empty($out)) {
	    $header = "image/jpg";
	    $src = DOCUMENT_ROOT . "image/default_char.jpg";
	    $img = file_get_contents($src);
	}
	header('Content-Type: ' . $header);
	echo $out;
	die();
    }

    public static function build_universe($user_id = null, $char_id = null, &$validate = array()) {
	$char = array();

	if (empty($user_id)) {
	    $user_id = fs_User::get("id");
	}

	if (empty($char_id)) {
	    $char = self::getByUserID(fs_User::get("id"));
	    $char_id = $char['id'];
	} else {
	    $char = self::get(["where" => "id = " . $char_id], $validate, self::table)[0];
	}

	$char["universe"] = fs_Universe::get(["where" => "character_id = " . $char_id], $validate)[0];

	$char["universe"]["celestial_objects"] = array();
	$objs = fs_Celestial_Object::get(["where" => "universe_id = " . $char["universe"]["id"]], $validate);

	foreach ($objs as $index => $cel_obj) {
	    $char["universe"]["celestial_objects"][$cel_obj["id"]] = $cel_obj;

	    $char["universe"]["celestial_objects"][$cel_obj["id"]]["satellites"] = array();
	    $sats = fs_Satellite::get(["where" => "celestial_object_id = " . $cel_obj["id"]], $validate);
	    foreach ($sats as $index => $sat) {
		$char["universe"]["celestial_objects"][$cel_obj["id"]]["satellites"][$sat["id"]] = $sat;

		$char["universe"]["celestial_objects"][$cel_obj["id"]]["satellites"][$sat["id"]]["platforms"] = array();
		$plats = fs_Platform::get(["where" => "satellite_id = " . $sat["id"]], $validate);
		foreach ($plats as $index => $plat) {
		    $char["universe"]["celestial_objects"][$cel_obj["id"]]["satellites"][$sat["id"]]["platforms"][$plat["id"]] = $plat;

		    $char["universe"]["celestial_objects"][$cel_obj["id"]]["satellites"][$sat["id"]]["platforms"][$plat["id"]]["buildings"] = array();
		    $builds = fs_Building::get(["where" => "platform_id = " . $plat["id"]], $validate);
		    foreach ($builds as $index => $build) {
			$char["universe"]["celestial_objects"][$cel_obj["id"]]["satellites"][$sat["id"]]["platforms"][$plat["id"]]["buildings"][$build["id"]] = $build;
		    }
		}
	    }
	}
	$char["resources"] = array();
	foreach (fs_Resource::get(["where" => "universe_id = " . $char["universe"]["id"]], $validate) as $index => $res) {
	    $char["resources"][$res["id"]] = $res;
	}

	$char["items"] = array();
	foreach (fs_Item::get(["where" => "universe_id = " . $char["universe"]["id"]], $validate) as $index => $item) {
	    $char["items"][$item["id"]] = $item;
	}

	$char["tech_tree"] = array();
	foreach (fs_Tech_Tree::get(["where" => "universe_id = " . $char["universe"]["id"]], $validate) as $index => $item) {
	    $char["tech_tree"][$item["id"]] = $item;
	}

	$char["expedition"] = array();
	foreach (fs_Item::get(["where" => "universe_id = " . $char["universe"]["id"]], $validate) as $index => $item) {
	    $char["expedition"][$item["id"]] = $item;
	}

	return $char;
    }

    public static function create($user_id, &$validate = array(), $table = self::table) {

	/**
	 * Create the Character
	 */
	$char_id = parent::create(array(
		    "user_id" => $user_id,
		    "name" => "My Name",
		    "created" => date("Y-m-d H:i:s")
			), $validate, CHARACTER_TABLE);

	/**
	 * Put the Character in a Universe
	 */
	$uni_id = fs_Universe::create(array(
		    "name" => "My Universe",
		    "frequency" => uniqid(),
		    "character_id" => $char_id), $validate);

	$types = fs_TypeTable::allTypes();
	$newchar = json_decode(file_get_contents(DOCUMENT_ROOT . "game/tables/newCharacter.json"), 1);

	if (!empty($newchar["resource"])) {
	    foreach ($newchar["resource"] as $id => $qty) {
		$res_id = fs_Resource::create($res = array(
			    "qty" => $qty,
			    "resource_type" => $id,
			    "universe_id" => $uni_id,
				), $validate);
	    }
	}

	if (!empty($newchar["item"])) {
	    foreach ($newchar["item"] as $id => $qty) {
		$item_id = fs_Item::create($item = array(
			    "item_type_id" => $id,
			    "qty" => $qty,
			    "universe_id" => $uni_id,
				), $validate);
	    }
	}
	if (!empty($newchar["celestial_object"])) {
	    $active_celestial_object = null;
	    foreach ($newchar["celestial_object"] as $index => $co) {
		if (empty($co)) {
		    continue;
		}

		$coID = fs_Celestial_Object::create(array(
			    "name" => $types["celestial_object"][$co["id"]]["name"],
			    "options" => array("active" => $active_celestial_object == null ? true : false),
			    "celestial_object_type_id" => $co["id"],
			    "universe_id" => $uni_id), $validate);
		$active_celestial_object = $coID;

		if (empty($co["satellite"])) {
		    continue;
		}
		foreach ($co["satellite"] as $index => $sat) {
		    if (empty($sat)) {
			continue;
		    }

		    $satID = fs_Satellite::create(array(
				"name" => $types["satellite"][$sat["id"]]["name"],
				"satellite_type_id" => $sat["id"],
				"celestial_object_id" => $coID), $validate);


		    if (empty($sat["platform"])) {
			continue;
		    }
		    foreach ($sat["platform"] as $index => $plat) {
			if (empty($plat)) {
			    continue;
			}
			$platID = fs_Platform::create($platform = array(
//				    "name" => $types["platform"][$plat["id"]]["name"],
				    "platform_type_id" => $plat["id"],
				    "options" => array(
					"platformPosition" => array(
					    "x" => $plat["x"],
					    "y" => $plat["y"],
					)
				    ),
				    "satellite_id" => $satID), $validate);

			if (empty($plat["building"])) {
			    continue;
			}
			foreach ($plat["building"] as $index => $build) {
			    if (empty($build)) {
				continue;
			    }
			    $buildID = fs_Building::create($hq = array(
					"name" => $types["building"][$build["id"]]["name"],
					"platform_id" => $platID,
					"building_type_id" => $build["id"],
					"options" => array(
					    "mount" => $build["mount"]
					)
					    ), $validate);
			}
		    }
		}
	    }
	}
//	print_r($validate);
    }

}
