<?php
$passChars = "!#$~ABCDEFGHIJKMNOPQRSTUVWXYZ!#$~abcdefghijklmnopqrstuvwkyz1234567890!#$~";
$bannedPasswords = array("000000", "111111", "11111111", "112233", "121212", "123123", "123456", "1234567", "12345678", "123456789", "131313", "232323", "654321", "666666", "696969", "777777", "7777777", "8675309", "987654", "aaaaaa", "abc123", "abc123", "abcdef", "abgrtyu", "access", "access14", "action", "albert", "alberto", "alexis", "alejandra", "alejandro", "amanda", "amateur", "america", "andrea", "andrew", "angela", "angels", "animal", "anthony", "apollo", "apples", "arsenal", "arthur", "asdfgh", "asdfgh", "ashley", "asshole", "august", "austin", "badboy", "bailey", "banana", "barney", "baseball", "batman", "beatriz", "beaver", "beavis", "bigcock", "bigdaddy", "bigdick", "bigdog", "bigtits", "birdie", "bitches", "biteme", "blazer", "blonde", "blondes", "blowjob", "blowme", "bond007", "bonita", "bonnie", "booboo", "booger", "boomer", "boston", "brandon", "brandy", "braves", "brazil", "bronco", "broncos", "bulldog", "buster", "butter", "butthead", "calvin", "camaro", "cameron", "canada", "captain", "carlos", "carter", "casper", "charles", "charlie", "cheese", "chelsea", "chester", "chicago", "chicken", "cocacola", "coffee", "college", "compaq", "computer", "consumer", "cookie", "cooper", "corvette", "cowboy", "cowboys", "crystal", "cumming", "cumshot", "dakota", "dallas", "daniel", "danielle", "debbie", "dennis", "diablo", "diamond", "doctor", "doggie", "dolphin", "dolphins", "donald", "dragon", "dreams", "driver", "eagle1", "eagles", "edward", "einstein", "erotic", "estrella", "extreme", "falcon", "fender", "ferrari", "firebird", "fishing", "florida", "flower", "flyers", "football", "forever", "freddy", "freedom", "fucked", "fucker", "fucking", "fuckme", "fuckyou", "gandalf", "gateway", "gators", "gemini", "george", "giants", "ginger", "gizmodo", "golden", "golfer", "gordon", "gregory", "guitar", "gunner", "hammer", "hannah", "hardcore", "harley", "heather", "helpme", "hentai", "hockey", "hooters", "horney", "hotdog", "hunter", "hunting", "iceman", "iloveyou", "internet", "iwantu", "jackie", "jackson", "jaguar", "jasmine", "jasper", "jennifer", "jeremy", "jessica", "johnny", "johnson", "jordan", "joseph", "joshua", "junior", "justin", "killer", "knight", "ladies", "lakers", "lauren", "leather", "legend", "letmein", "letmein", "little", "london", "lovers", "maddog", "madison", "maggie", "magnum", "marine", "mariposa", "marlboro", "martin", "marvin", "master", "matrix", "matthew", "maverick", "maxwell", "melissa", "member", "mercedes", "merlin", "michael", "michelle", "mickey", "midnight", "miller", "mistress", "monica", "monkey", "monkey", "monster", "morgan", "mother", "mountain", "muffin", "murphy", "mustang", "naked", "nascar", "nathan", "naughty", "ncc1701", "newyork", "nicholas", "nicole", "nipple", "nipples", "oliver", "orange", "packers", "panther", "panties", "parker", "password", "password", "password1", "password12", "password123", "patrick", "peaches", "peanut", "pepper", "phantom", "phoenix", "player", "please", "pookie", "porsche", "prince", "princess", "private", "purple", "pussies", "qazwsx", "qwerty", "qwertyui", "rabbit", "rachel", "racing", "raiders", "rainbow", "ranger", "rangers", "rebecca", "redskins", "redsox", "redwings", "richard", "robert", "roberto", "rocket", "rosebud", "runner", "rush2112", "russia", "samantha", "sammy", "samson", "sandra", "saturn", "scooby", "scooter", "scorpio", "scorpion", "sebastian", "secret", "sexsex", "shadow", "shannon", "shaved", "sierra", "silver", "skippy", "slayer", "smokey", "snoopy", "soccer", "sophie", "spanky", "sparky", "spider", "squirt", "srinivas", "startrek", "starwars", "steelers", "steven", "sticky", "stupid", "success", "suckit", "summer", "sunshine", "superman", "surfer", "swimming", "sydney", "tequiero", "taylor", "tennis", "teresa", "tester", "testing", "theman", "thomas", "thunder", "thx1138", "tiffany", "tigers", "tigger", "tomcat", "topgun", "toyota", "travis", "trouble", "trustno1", "tucker", "turtle", "twitter", "united", "vagina", "victor", "victoria", "viking", "voodoo", "voyager", "walter", "warrior", "welcome", "whatever", "william", "willie", "wilson", "winner", "winston", "winter", "wizard", "xavier", "xxxxxx", "xxxxxxxx", "yamaha", "yankee", "yankees", "yellow", "zxcvbn", "zxcvbnm", "zzzzzz");

function generatePassword() {
    global $bannedPasswords;
    global $passChars;

    $pass = substr($passChars, rand(0, strlen($passChars)), 1);
    $pass .= substr($passChars, rand(0, strlen($passChars)), 1);
    $pass .= substr($passChars, rand(0, strlen($passChars)), 1);
    $pass .= substr($passChars, rand(0, strlen($passChars)), 1);
    $pass .= substr($passChars, rand(0, strlen($passChars)), 1);
    $pass .= substr($passChars, rand(0, strlen($passChars)), 1);
    $pass .= substr($passChars, rand(0, strlen($passChars)), 1);
    $pass .= substr($passChars, rand(0, strlen($passChars)), 1);
    $pass .= substr($passChars, rand(0, strlen($passChars)), 1);
    $pass .= substr($passChars, rand(0, strlen($passChars)), 1);
    if (in_array($pass, $bannedPasswords)) {
	return generatePassword();
    }
    return $pass;
}

function cleanArray(&$arr, $cleanItems) {
    foreach ($cleanItems as $value) {
	if (!empty($arr[$value])) {
	    unset($arr[$value]);
	}
    }
    if (is_array($arr)) {
	foreach ($arr as $key => $value) {
	    if ($key == "options" && gettype($value) == "string") {
		$arr[$key] = json_decode($value);
	    }
	    if (is_array($arr[$key])) {
		cleanArray($arr[$key], $cleanItems);
	    }
	}
    }
}
function array_remove_empty($haystack) {
    foreach ($haystack as $key => $value) {
        if (is_array($value)) {
            $haystack[$key] = array_remove_empty($haystack[$key]);
        }

        if (empty($haystack[$key])) {
            unset($haystack[$key]);
        }
    }

    return $haystack;
}

function empty_or($check, $alternate = NULL) {
    if (empty($check)) {
	return $alternate;
    } else {
	return $check;
    }
}

function number_or($check, $alternate = 0) {
    if (empty($check)) {
	return $alternate;
    } else {
	if (preg_match('/^([0-9]*|\d*\.\d{1}?\d*)$/', $check)) {
	    return $check;
	} else {
	    return $alternate;
	}
    }
}

function validateBasicText(&$validate, $col, $colName, $text, $min = 1, $max = 255, $canBeNull = true) {
    if ($canBeNull && empty($text)) {
	return true;
    } else if (!$canBeNull && empty($text)) {
	error($col, "A value for " . $colName . " is required.", $validate, false);
	return false;
    }
    if ($min && strlen($text) < $min) {
	error($col, $colName . " to short. Must be at least " . $min . " characters", $validate, false);
	return false;
    }
    if ($max && strlen($text) > $max) {
	error($col, $colName . " to long. Cannot exceede " . $max . " characters", $validate, false);
	return false;
    }
    return true;
}

function validateInteger(&$validate, $col, $colName, $int, $min = 1, $max = 255, $canBeNull = true) {
    $i = intval($int);
    if ($canBeNull && $int == null) {
	return true;
    } else if (!$canBeNull && $int == null) {
	error($col, "A value for " . $colName . " is required.", $validate, false);
	return false;
    }

    if ($min && $i < $min) {
	error($col, $colName . " to small. Must be at least " . $min . " characters", $validate, false);
	return false;
    }
    if ($max && $i > $max) {
	error($col, $colName . " to large. Cannot exceede " . $max . " characters", $validate, false);
	return false;
    }
    return true;
}

function validateEmail(&$validate, $col, $colName, $email, $canBeNull = TRUE) {
    if ($canBeNull && empty($email)) {
	return true;
    } else if (!$canBeNull && empty($email)) {
	error($col, "A value for " . $colName . " is required.", $validate, false);
	return false;
    }
    if (!preg_match('/^[^@]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$/', $email)) {
	error($col, "Email address does not appear to be valid. (" . $email . ")", $validate, false);
	return false;
    }

    return true;
}

function validateRegex(&$validate, $col, $colName, $value, $regex, $canBeNull = TRUE) {
    if ($canBeNull && empty($value)) {
	return true;
    } else if (!$canBeNull && empty($value)) {
	error($col, "A value for " . $colName . " is required.", $validate, false);
	return false;
    }
    if (!preg_match($regex, $value)) {
	error($col, $colName . " contains invalid characters:<br/>" . strip_tags(preg_replace($regex, '', $value)), $validate, false);
    }

    return true;
}

function validatePhone(&$validate, $col, $colName, $phone, $canBeNull = TRUE) {
    if ($canBeNull && empty($phone)) {
	return true;
    } else if (!$canBeNull && empty($phone)) {
	error($col, "A value for " . $colName . " is required.", $validate, false);
	return false;
    }
    if (!preg_match('/^[\d\s ().-]+$/', $phone)) {
	error($col, "Phone Number does not appear to be valid.", $validate, false);
	return false;
    }

    return true;
}

function validateDate(&$validate, $col, $colName, $date, $canBeNull = TRUE) {
    if ($canBeNull && empty($date)) {
	return true;
    } else if (!$canBeNull && empty($date)) {
	error($col, "A value for " . $colName . " is required.", $validate, false);
	return false;
    }

    $date_arr = explode('/', $date);
    if (count($date_arr) == 3) {
	if (checkdate($date_arr[0], $date_arr[1], $date_arr[2])) {
	    return true;
	} else {
	    error($col, "Date does not appear to be valid.", $validate, false);
	    return fales;
	}
    } else {
	error($col, "Date does not appear to be valid.", $validate, false);
	return false;
    }
}

function error($title, $mixed = "", &$validate = array(), $log = true) {
    if (empty($validate["errors"])) {
	$validate["errors"] = array();
    }
//
//    $e = new \Exception;
//    ob_start();
//    var_dump($e->getTraceAsString());
//    $ex = ob_get_clean();

    array_push($validate["errors"], array(
	"title" => $title,
	"value" => $mixed
    ));
    $validate["error"] = true;
    fs_Debug::log($title, ERROR, $mixed);
}

function hasError($validate) {
    if (!empty($validate) && $validate["error"]) {
	return true;
    }
    return false;
}

function url_origin($s, $use_forwarded_host = false) {
    $ssl = (!empty($s['HTTPS']) && $s['HTTPS'] == 'on' );
    $sp = strtolower($s['SERVER_PROTOCOL']);
    $protocol = substr($sp, 0, strpos($sp, '/')) . ( ( $ssl ) ? 's' : '' );
    $port = $s['SERVER_PORT'];
    $port = ( (!$ssl && $port == '80' ) || ( $ssl && $port == '443' ) ) ? '' : ':' . $port;
    $host = ( $use_forwarded_host && isset($s['HTTP_X_FORWARDED_HOST']) ) ? $s['HTTP_X_FORWARDED_HOST'] : ( isset($s['HTTP_HOST']) ? $s['HTTP_HOST'] : null );
    $host = isset($host) ? $host : $s['SERVER_NAME'] . $port;
    return $protocol . '://' . $host;
}

function full_url($s, $use_forwarded_host = false) {
    return url_origin($s, $use_forwarded_host) . $s['REQUEST_URI'];
}

function pp($arr) {
    $retStr = '<ul class="pp">';
    if (is_array($arr)) {
	foreach ($arr as $key => $val) {
	    if (is_array($val)) {
		$retStr .= '<li><span>' . $key . '</span><b> => </b><span>' . pp($val) . '</span></li>';
	    } else {
		$retStr .= '<li><span>' . $key . '</span><b> => </b><span>' . print_r($val, 1) . '</span></li>';
	    }
	}
    }
    $retStr .= '</ul>';
    return $retStr;
}

function getUserIpAddr() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
	//ip from share internet
	$ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
	//ip pass from proxy
	$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
	$ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

/**
 * For Facebook Requests
 * @param type $signed_request
 * @return type
 */
function parse_signed_request($signed_request) {
    list($encoded_sig, $payload) = explode('.', $signed_request, 2);

    $secret = CONFIG["facebook"]["app_secret"]; // Use your app secret here
    // decode the data
    $sig = base64_url_decode($encoded_sig);
    $data = json_decode(base64_url_decode($payload), true);

    // confirm the signature
    $expected_sig = hash_hmac('sha256', $payload, $secret, $raw = true);
    if ($sig !== $expected_sig) {
	error_log('Bad Signed JSON signature!');
	return null;
    }

    return $data;
}

function base64_url_decode($input) {
    return base64_decode(strtr($input, '-_', '+/'));
}

/*
 * Name editor
 */

function name_editor($args) {
    ob_start();
    //print_r($args);
    ?>
    <form id="name-<?= $args['table'] ?>" form="name-<?= $args['table'] ?>" method='post'>
        <div class='name-wrapper'>
    	<h<?= $args['h'] ?>><span><?= $args['name'] ?></span></h<?= $args['h'] ?>>
    	<div class='name-edit-wrapper'>
    	    <a href="javascript:;" triggers="form:name-<?= $args['table'] ?>-cancel" class="name-<?= $args['table'] ?>-cancel"><span>Cancel</span></a>
    	    <a href="javascript:;" triggers="form:name-<?= $args['table'] ?>-save" class="name-<?= $args['table'] ?>-save"><span>Save</span></a>
    	    <a href="javascript:;" triggers="form:name-<?= $args['table'] ?>-edit" class="name-<?= $args['table'] ?>-edit"><span>Edit</span></a>
    	    <input type='text' name='name' value='<?= $args['name'] ?>' placeholder="<?= $table ?> name" />
    	    <div class='error'></div>
    	</div>
        </div>
    </form>
    <?php
    $out = ob_get_clean();
    return $out;
}
