<?php

define('USER_TABLE', '`user`');
define('USER_PREFIX', 'u');
define('USER_TABLE_SEL', USER_TABLE . ' ' . USER_PREFIX);

fs_Main::q_xhr('login', "fs_User::login_ajax");
fs_Main::q_xhr('create', "fs_User::create_ajax");
fs_Main::q_xhr('verify', "fs_User::verify_ajax");
fs_Main::q_xhr('reset', "fs_User::reset_ajax");
fs_Main::q_xhr('req_reset', "fs_User::req_reset_ajax");

class fs_User {

    private $_loggedIn = false;
    private $_row = null;
    public static $fb_error = "";

    function __construct() {

    }

    public static function me() {
	if (isset($_SESSION['user'])) {
	    $user = unserialize($_SESSION['user']);
	    return $user;
	} else {
	    $user = new fs_User();
	    $_SESSION['user'] = serialize($user);
	    return $user;
	}
    }

    public static function isLoggedIn() {
	return self::me()->_loggedIn;
    }

    public function setLoggedIn($status) {
	$this->_loggedIn = $status;
	$_SESSION['user'] = serialize($this);
    }

    public static function get($col) {
	return self::me()->_row[$col];
    }

    public static function getRow() {
	return self::me()->_row;
    }

    public function logout() {
	$this->_loggedIn = false;
	$_SESSION['user'] = serialize($this);
	fs_DB::updateDB_array($validate, array('logout' => date("Y-m-d H:i:s")), "u.user", "id = " . $this->get("id"));
    }

    public static function get_login() {
	//include_once(DOCUMENT_ROOT . 'views/fs_User/fsv_Login.php');
    }

    public static function login_ajax() {
	$validate = array();
	if (self::me()->login($_POST, $validate)) {
	    fs_Main::q_response("success", '<span class="success">Login Successfull<br><br>Redirecting...</span>');
	} else {
	    fs_Main::q_response("success", false);
	    fs_Main::q_response("validate", $validate);
	}
    }

    public function login($args, &$validate = array()) {
	if (fs_User::isLoggedIn()) {
	    //return getApplication();
	}
	$email = $args['email'];
	$pass = $args['password'];

	validateEmail($validate, "email", "Email Address", $email, false);
	validateBasicText($validate, "password", "Password", $pass, 1, 255, false);

	if (hasError($validate)) {
	    return false;
	}

	$sql = "SELECT " . USER_PREFIX . ".*
                    FROM " . USER_TABLE_SEL . "
                    WHERE " . USER_PREFIX . ".email = ?";
	$stmt = fs_DB::prepare($sql, $validate);
	$stmt->bind_param("s", $email);
	$result = fs_DB::fetch($stmt, $validate);
	if (empty($result)) {
	    error("Login Error", 'Email Address/Password Combination not found.', $validate);
	} else {
	    $result = $result[0];

	    $cipher = new fs_Cipher($pass . AUTH_SALT, base64_decode($iv = fs_Options::get($result, "iv", $validate)));
	    $hash = md5($cipher->encrypt($pass . AUTH_SALT));

	    if (!empty(fs_Options::get($result, "verify_key", $validate))) {
		error("Login Error", 'Account is currently awaiting verification. Check your email.', $validate);
	    } else if ($result['active'] == 0) {
		error("Login Error", 'This account has been disabled. Please speak with an administrator.', $validate);
	    } else if ($email == $result['email'] && $result["password"] == $hash) {
		fs_User::loginUser($this, $result);
		fs_User::save($result, $validate);
		return !hasError($validate);
	    } else {
		error("Login Error", 'Email Address/Password Combination not found.', $validate);
	    }
	}
	return false;
    }

    public static function loginUser($user, &$result) {
	$user->_loggedIn = true;
	$user->_row = $result;

	fs_Options::set($result, "last_login", date("Y-m-d H:i:s"));
	unset($result["password"]);
	unset($result["prev-password"]);
	unset($result["password-again"]);

	$_SESSION['user'] = serialize($user);
	fs_Debug::log("Login Sucess", SUCCESS, $result);
    }

    public static function refreshUser() {
	if (fs_User::get("id") == 0) {
	    return false;
	}
	fs_Debug::log("Refreshing User Details", TRACE);
	$validate = array();
	$sql = "SELECT " . USER_PREFIX . ".* "
		. "FROM " . USER_TABLE_SEL . " "
		. "WHERE " . USER_PREFIX . ".id = " . fs_User::get('id');
	$stmt = fs_DB::prepare($sql, $validate);
	$result = fs_DB::fetch($stmt, $validate);
	if (!empty($result)) {
	    $result = $result[0];
	    $user = unserialize($_SESSION['user']);
	    $user->_row = $result;
	    $_SESSION['user'] = serialize($user);
	    return true;
	} else {
	    session_destroy();
	    error("Could not refresh user details", "");
	}
	return false;
    }

    /*
     * Allow the user to request a password reset
     *
     */

    public static function req_reset_ajax() {
	$validate = array();
	$_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
	$args = $_POST;
	if (self::resetPasswordRequest($args, $validate)) {

	} else {
	    fs_Main::q_response("success", false);
	    fs_Main::q_response("validate", $validate);
	}
    }

    public static function resetPasswordRequest(&$args, &$validate = array()) {

	$email = $args['email'];

	validateEmail($validate, "email", "Email Address", $email, false);

	if (hasError($validate)) {
	    return false;
	}

	$sql = "SELECT u.* FROM " . USER_TABLE_SEL . " "
		. " WHERE u.email = ? ";

	$stmt = fs_DB::prepare($sql, $validate);
	$stmt->bind_param("s", $email);
	$result = fs_DB::fetch($stmt, $validate);

	if (empty($result)) {

	} else {
	    $result = $result[0];
	    if (!empty($result['password'])) {
		$email = $result['email'];
		$reset_key = md5($email . AUTH_SALT);

		$args = $result;
		ob_start();
		include_once(DOCUMENT_ROOT . 'views/fs_User/fsv_ReqResetEmail.php');
		$body = ob_get_clean();
		$subject = "Reset Password Link: " . CONFIG["title"];
		fs_Mail::queue_mail($email, $subject, $body);
		fs_Main::q_response("success", '<span class="success">Reset Request Successfull<br><br>Please check your email for the magic reset link</span>');
		fs_Debug::log('Password Reset Requested', SUCCESS, $reset_key);
		return true;
	    }
	}
	error("User Not Found.", "", $validate);
	return false;
    }

    /*
     * Reset the users password to a random password and email it to them.
     */

    public static function reset_ajax() {
	$validate = array();

	if (empty($_POST)) {
	    $_GET = filter_input_array(INPUT_GET, FILTER_SANITIZE_STRING);
	    $args = $_GET;
	} else {
	    $_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
	    $args = $_POST;
	}

	if (self::resetPassword($args, $validate)) {

	} else {
	    fs_Main::q_response("success", false);
	    fs_Main::q_response("validate", $validate);
	}
    }

    public static function resetPassword(&$args, $validate = array()) {

	$email = $args['email'];
	$reset_key = $args['reset_key'];

	validateEmail($validate, "email", "Email Address", $email, false);
	validateBasicText($validate, "resetKey", "Reset Key", $reset_key, 2, 255, false);

	if (hasError($validate)) {
	    return false;
	}

	$sql = "SELECT u.* FROM " . USER_TABLE_SEL . " WHERE u.email = ?";
	$stmt = fs_DB::prepare($sql, $validate);
	$stmt->bind_param("s", $email);
	$result = fs_DB::fetch($stmt, $validate);

	if (!empty($result)) {
	    $result = $result[0];
	    if ($reset_key == md5($result['email'] . AUTH_SALT)) {

		$newPass = generatePassword();

		fs_Options::set($result, "iv", base64_encode($iv = openssl_random_pseudo_bytes(16)), $validate);
		fs_Options::set($result, "reset_from", getUserIpAddr());

		$cipher = new fs_Cipher($newPass . AUTH_SALT, $iv);
		$hash = md5($cipher->encrypt($newPass . AUTH_SALT));
		$result['password'] = $hash;
		fs_DB::begin();
		fs_DB::updateDB_array($validate, $result, USER_TABLE, " WHERE id = " . $result["id"]);
		fs_DB::commit();

		unset($result['password']);
		$args["password"] = $newPass;

		$args = $result;
		ob_start();
		include_once(DOCUMENT_ROOT . 'views/fs_User/fsv_ResetEmail.php');
		$body = ob_get_clean();
		$subject = "Password Reset: " . CONFIG["title"];
		fs_Mail::queue_mail($email, $subject, $body);
		fs_Main::q_response('success', '<span class="success">Password successfully reset. Check your email for your new password.</span>');
		fs_Debug::log("Password Reset Succeeded", SUCCESS);
		return true;
	    } else {
		unset($result['password']);
		fs_Options::set($result, "reset_from", getUserIpAddr());
		fs_User::save($result);
	    }
	}

	error("Reset Password Error", $validate);
	return false;
    }

    /*
     * Verify a new account through the emailed verification key
     */

    public static function verify_ajax() {
	$validate = array();

	if (empty($_POST)) {
	    $_GET = filter_input_array(INPUT_GET, FILTER_SANITIZE_STRING);
	    $args = $_GET;
	} else {
	    $_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
	    $args = $_POST;
	}

	if (self::verifyAccount($args, $validate)) {

	} else {
	    fs_Main::q_response("success", false);
	    fs_Main::q_response("validate", $validate);
	}
    }

    public static function verifyAccount(&$args, &$validate = array()) {
	fs_Debug::log("Verifying Account", TRACE);
	$email = $args['email'];
	$key = $args['verify_key'];

	validateEmail($validate, "email", "Email Address", $email, false);
	validateBasicText($validate, "verify_key", "Verification Key", $key, 2, 255, true);

	if (hasError($validate)) {
	    return false;
	}

	$sql = "SELECT u.* FROM " . USER_TABLE_SEL . " WHERE email = ?";
	$stmt = fs_DB::prepare($sql, $validate);
	$stmt->bind_param("s", $email);
	$result = fs_DB::fetch($stmt, $validate);
	if (empty($result)) {
	    error('verify_key', 'Match Not Found.', $validate);
	    return false;
	} else {
	    $result = $result[0];
	    if (($curkey = fs_Options::get($result, "verify_key", $validate)) == $key && !empty($curkey)) {
		fs_Options::remove($result, "verify_key", $validate);
		fs_User::loginUser(fs_User::me(), $result);
		fs_User::save($result, $validate);
		fs_Debug::log('Verified', SUCCESS, "Verification Key Matched");
		fs_Main::q_response('success', '<span class="success">Account Successfully Verified<br><Br>Reloading Page...</span>');
		return true;
	    } else {
		if (!empty($curkey) && empty($key)) {
		    return self::resendVerifyEmail($args, $validate);
		} else {
		    error('verify_key', 'Match Not Found.', $validate);
		}
	    }
	}

	return false;
    }

    /*
     * Re-send the verification email to the user.
     */

    public static function resendVerifyEmail(&$args, & $validate = array()) {

	$email = $args['email'];
	validateEmail($validate, "email", "Email Address", $email, false);
	if (hasError($validate)) {
	    return false;
	}

	$sql = "SELECT u.*
			FROM " . USER_TABLE_SEL . "
			WHERE u.email = ?";
	$stmt = fs_DB::prepare($sql, $validate);
	$stmt->bind_param("s", $email);
	$result = fs_DB::fetch($stmt);
	if (empty($result)) {
	    error('email', 'User Not Fount', $validate);
	} else {
	    $result = $result[0];
	    $verify_key = fs_Options::get($result, "verify_key", $validate);
	    if (!$verify_key) {
		$args = $result;
		ob_start();
		include_once(DOCUMENT_ROOT . 'views/fs_User/fsv_VerifyEmail.php');
		$body = ob_get_clean();
		$subject = "Account Activation Link: " . CONFIG["title"];
		fs_Mail::queue_mail($args["email"], $subject, $body);
		fs_Main::q_response('success', '<span class="success">We have sent you an email to verify your accout.<br/>Please check your inbox/spam box for our email.</span>');
		fs_Debug::log("Verification Email Resent", SUCCESS, $verifyKey);
		return true;
	    } else {
		error('email', 'Not Found or no verification key needed.', $validate);
	    }
	}
	return false;
    }

    public static function checkDupeEmailAddress($email, $id, &$validate = array()) {
	$dupe = null;
	fs_Debug::log("Checking duplicate Email Address", TRACE, $email);

	if (empty($email)) {
	    error("Dupe User", "Invalid Email Address: " . $email, $validate, false);
	    return false;
	}
	$sql = "SELECT " . USER_PREFIX . ".email FROM " . USER_TABLE_SEL . " "
		. "WHERE " . USER_PREFIX . ".email = ? AND " . USER_PREFIX . ".id <> ?";
	$stmt = fs_DB::prepare($sql, $validate);
	fs_DB::bind_params($stmt, "ss", ["email" => $email, "id" => $id]);
	$result = fs_DB::fetch($stmt, $validate);
	if (!hasError($validate)) {
	    if (!empty($result[0])) {
		error("email", "Please choose another email. The email " . $email . " is already taken.", $validate, false);
		return false;
	    } else {
		fs_Debug::log("Email Address Available", TRACE, $email);
		return true;
	    }
	} else {
	    error("Error checking for duplicate Email Address", fs_DB::$mysqli->errpr, $validate, false);
	}
	return false;
    }

    public static function validate(&$args, &$validate = array()) {
	if (!empty($args["facebook"]) || !empty($args["google"])) {
	    return true;
	}
	global $bannedPasswords;

	$id = number_or($args['id']);
	$email = trim((empty_or($args['email'])));
	fs_Debug::log("Validating User", TRACE, $email);

	$password = trim(empty_or($args['password']));
	$prevPassword = trim(empty_or($args['prev-password']));
	unset($args['prev-password']);
	validateEmail($validate, 'email', 'Email Address', $email, false);
	if (hasError($validate)) {
	    return false;
	}

	/* Ignore password field for existing users unless they are updating their password */
	if ($id === 0 || (!empty($prevPassword) && !empty($password)) || !fs_User::isLoggedIn()) {
	    validateBasicText($validate, "password", "Password", $password, 7, 50, false);
	    if (in_array($password, $bannedPasswords)) {
		error("password", "The password you selected<br/>has been banned for being<br/>'to obvious', 'to short', or 'to weak'.<br>Please select a diffeent password.", $validate);
	    }
	    $passAgain = trim($args['password-again']);
	    unset($args['password-again']);

	    if ($passAgain != $password) {
		error("password", "Passwords do not match.", $validate);
	    }
	}
	if (hasError($validate)) {
	    return false;
	}
	if ($id === 0 || !fs_User::isLoggedIn()) {
	    $verify_key = md5($email . $password . NONCE_SALT);
	    //fs_Options::set($args, "verify_key", $verify_key, $validate);
	    $args["active"] = 1;
	}

	fs_User::checkDupeEmailAddress($email, $id, $validate);
	$args['email'] = $email;

	if (hasError($validate)) {
	    return false;
	}

	if (empty($password) && empty($id)) {
	    error("password", "A Password must be provided.", $validate);
	} else if (!empty($password) && empty($id)) {
	    fs_Options::set($args, "iv", base64_encode($iv = openssl_random_pseudo_bytes(16)), $validate);
	    $cipher = new fs_Cipher($password . AUTH_SALT, $iv);
	    $hash = md5($cipher->encrypt($password . AUTH_SALT));

	    $args['password'] = $hash;
	    fs_Debug::log("Setting Password", TRACE, $hash);
	} else if ((((empty($prevPassword) && !empty($password) ) || (!empty($prevPassword) && empty($password) ) ) && !empty($id))) {
	    error("password", "Both old and new passwords must be provided.", $validate);
	} else if ((!empty($prevPassword)) && !empty($password) && !empty($id)) {
	    $sql = "SELECT " . USER_PREFIX . ".password FROM " . USER_TABLE_SEL . " WHERE " . USER_PREFIX . ".id = " . $id;
	    $stmt = fs_DB::prepare($sql, $validate);
	    $row = fs_DB::fetch($stmt, $validate);
	    if (!empty($row)) {
		$row = $row[0];
		$cipher = new fs_Cipher($prevPassword . AUTH_SALT, base64_decode(fs_Options::get($args, "iv", $validate)));
		$hash = md5($cipher->encrypt($prevPassword . AUTH_SALT));

		//echo $prevPassword . ': ' . $hash . '<br/>' . $row['password'];
		if ($hash == $row['password']) {
		    //SET NET PASS HASH
		    fs_Options::set($args, "iv", base64_encode($iv = openssl_random_pseudo_bytes(16)), $validate);
		    $cipher = new fs_Cipher($password . AUTH_SALT, $iv);
		    $hash = md5($cipher->encrypt($password . AUTH_SALT));
		    $args['password'] = $hash;
		    fs_Debug::log("New Password", SUCCESS);
		} else {
		    error("password", "Incorrect old password. Please re-enter. ", $validate);
		}
	    } else {
		error("User not found.", "", $validate);
	    }
	}

	return !hasError($validate);
    }

    public static function create_ajax() {
	$validate = array();
	$args = $_POST;
	if (fs_User::create($args, $validate)) {

	} else {
	    fs_Main::q_response("success", false);
	    fs_Main::q_response("validate", $validate);
	}
    }

    /*
     * Process incoming new/update user requests.
     */

    public static function save(&$args, $lonetransaction = true, &$validate = array()) {
	fs_Debug::log("Saving User", TRACE);

	if (!fs_User::validate($args, $validate)) {
	    //error("User Validation Failed", $validate, $validate);
	    return false;
	}
	$id = null;
	if (isset($args['id'])) {
	    $id = number_or($args['id']);
	}

	if (empty($id)) {
	    $args['created'] = date("Y-m-d H:i:s");
	} else {
	    $args['updated'] = date("Y-m-d H:i:s");
	}

	fs_DB::begin($lonetransaction);
	fs_Options::remove($args, "changed", $validate);
	if (empty($id)) {
	    $args['id'] = fs_DB::insertDB_array($validate, $args, USER_TABLE);
	} else {
	    fs_DB::updateDB_array($validate, $args, USER_TABLE, " WHERE id = " . $id);
	}
	//return;
	if (!hasError($validate)) {

	    fs_Debug::log("User saved successfully", SUCCESS);
	    fs_DB::commit($lonetransaction);
	    if (!empty($args["facebook"]) || !empty($args["google"])) {
		fs_Main::q_response('success', '<span class="success">Thank you for registering. User Successfully created.</span>');
		return true;
	    }

	    if (!fs_User::isLoggedIn()) {
		fs_Debug::log("Mailing out new account activation email.", SUCCESS);
		$verify_key = fs_Options::get($args, "verify_key", $validate);
		ob_start();
		include_once(DOCUMENT_ROOT . 'views/fs_User/fsv_VerifyEmail.php');
		$body = ob_get_clean();
		$subject = "Account Activation Link: " . CONFIG["title"];
		fs_Mail::queue_mail($args["email"], $subject, $body);
		fs_Main::q_response('success', '<span class="success">Thank you for registering.<br/><br/>We have sent you an email to verify your accout.<br/>Please check your inbox/spam box for our email.</span>');
		return true;
	    } else if ($id === 0 && $_POST['emailUser'] != 2) {

//		fs_Debug::log("New Account Created. Mailing user account details.");
//		$subject = "" . SITENAME . " - New Account Created";
//
//		$message = '<a href="' . ROOT_URL . '">' . SITENAME . '</a><br/><br/>' .
//			"Your new <a href=\"" . ROOT_URL . "\">" . SITENAME . "</a> account is ready.<br><a href=\"" . ROOT_URL . "\">Login</a> withe the information provided below.<br><br>" .
//			"Email Address: " . $email . "<br>" .
//			"Password: " . $_POST['password'] . "<br/><br/>" .
//			"Security Question: " . $_POST['securityQuestion'] . "<br/>" .
//			"Security Answer: " . $_POST['securityAnswer'] . "<br/><br/>" .
//			(!empty($verify_key) ? "Verification Key: " . $verify_key . "<br><br>" : "") .
//			(!empty($verify_key) ? "Verification Link: <a href=\"" . ROOT_URL . "/index.php?xhr=true&a=VerifyAccount&amp;emaillink=true&amp;verify_key=" . $verify_key . "&amp;email=" . $email . "\">" . ROOT_URL . "/index.php?xhr=true&a=VerifyAccount&amp;emaillink=true&amp;verify_key=" . $verify_key . "&amp;email=" . $email . "</a>" : "") .
//			"<br>" .
//			EMAILFOOTER;
//
//		if (!empty($email)) {
//		    queue_mail($email, $subject, $message);
//		    return success('New account created. An Email with account information has been sent to ' . $email, array("userID" => $user['userID'], "contactID" => $user["contactID"], "email" => $email));
//		} else {
//		    return success('Could not email user. No email address provided. (' . $email . ')', array("userID" => $args['userID'], "contactID" => $args["contactID"], "email" => $email));
//		}
		return true;
	    } else if ($id == 0 && $_POST['emailUser'] === 2) {
		return true;
	    } else if (!empty($user['password']) && $_POST['emailUser'] != 2) {
//		fs_Debug::log("Account password updated. Emailing new password.");
//		$subject = "" . SITENAME . " - Account Updated";
//
//		$message = '<a href="' . ROOT_URL . '">' . SITENAME . '</a>' .
//			"Your account password has recently been changed:<br><br>" .
//			"Email Address: " . $email . "<br>" .
//			"New Password: " . empty_or($_POST['password']) . "<br><br>" .
//			EMAILFOOTER;
//
//		queue_mail($email, $subject, $message);
		return true;
	    } else {
//		fs_Debug::log("User Account Updated Successfully.");
//		if ($_POST["emailUser"] == 2) {
//		    $subject = "" . SITENAME . " - Account Updated";
//
//		    $message = '' .
//			    "Account information updated <a href=\"" . ROOT_URL . "\">" . SITENAME . "</a><br><br>" .
//			    "Email Address: " . $email . "<br>" .
//			    "Security Question: " . $_POST['securityQuestion'] . "<br>" .
//			    "Security Answer: " . $_POST['securityAnswer'] . "<br><br>" .
//			    (!empty($verify_key) ? "Verification Key: " . $verify_key . "<br><br>" : "") .
//			    "Verification Link: <a href=\"" . ROOT_URL . "/index.php?xhr=true&a=VerifyAccount&amp;emaillink=true&amp;verify_key=" . $verify_key . "&amp;email=" . $email . "\">" . ROOT_URL . "/index.php?xhr=true&a=VerifyAccount&amp;emaillink=true&amp;verify_key=" . $verify_key . "&amp;email=" . $email . "</a>" .
//			    "<br>Please follow the verification link to activate your account.<br><br>" .
//			    EMAILFOOTER;
//		    if (!empty($email)) {
//			queue_mail($email, $subject, $message);
//			return success('Account information successfully updated.<br/>An email has been sent to the user with their account information', array("userID" => $user['userID'], "contactID" => $args["contactID"]));
//		    }
//		}
//		return success('Account successfully updated.', array("userID" => $args['userID'], "contactID" => $args["contactID"]));
		return true;
	    }
	} else {
	    error("Saving User Failed", $args, $validate);
	    fs_DB::rollback($lonetransaction);
	    return false;
	}
    }

    public static function load($id) {
	$id = number_or($id);
	fs_Debug::log("Loading User", TRACE, $id);
	if (empty($id)) {
	    return false;
	}
	$validate = array();

	$sql = "SELECT " . USER_PREFIX . ".* "
		. "FROM " . USER_TABLE_SEL . " "
		. "WHERE " . USER_PREFIX . ".id = " . $id;
	$stmt = fs_DB::prepare($sql, $validate);
	$result = fs_DB::fetch($stmt, $validate);
	if (!empty($result)) {
	    fs_Debug::log("Loading User", SUCCESS);
	    return $result[0];
	} else {
	    error("0 Users Found", "", $validate);
	    return false;
	}
    }

    public static function updateLastAccess(&$validate = array()) {
	fs_Options::set(fs_User::me()->$_row, "last_access", tine(), $validate);
	return !hasError($validate);
    }

    public static function updateVerifyKey(&$validate = array()) {
	fs_Options::set(fs_User::me()->$_row, "verify_key", tine(), $validate);
	return !hasError($validate);
    }

    public static function listUsers($args, &$validate = array()) {
	fs_Debug::log("Listing Users");

	if (!empty($args["id"])) {
	    $where .= " AND " . USER_PREFIX . ".id = " . $args["id"];
	}

	//columes allowed to be sorted on
	$sortColumns = array("id", "email", "active", "created", "updated", "facebook", "google");
	$sortBy = "created";
	if (in_array($args["sortBy"], $sortColumns)) {
	    $sortBy = $args["sortBy"];
	}
	$sortDir = " DESC";
	if ($args["sortDir"] == "ASC") {
	    $sortDir = " ASC";
	}

	/* Limit results */
	$perpage = "15";
	if (validateInteger($validate, "perpage", "Per Page", $args["perpage"], 5, 100, false)) {
	    $perpage = $args["perpage"];
	}
	$pagenum = 0;
	if (validateInteger($validate, "pagenum", "Page Number", $args["pagenum"], 0, 9999, true)) {
	    if (empty($args["pagenum"])) {
		$pagenum = 0;
	    }
	    $pagenum = $args["pagenum"] * 1;
	}


	/* Enabled */
	$enabled = array("0", "1");
	if (is_array($args['active'])) {
	    $where .= " AND active in (";
	    foreach ($args["active"] as $key => $value) {
		if (in_array($value, $enabled)) {
		    $where .= "'" . $value . "',";
		}
	    }
	    $where = substr($where, 0, strlen($where) - 1);
	    $where .= ")";
	} else {
	    if (in_array($args["active"], $enabled)) {
		$where .= " AND u.active = " . $args["enabled"] . "";
	    }
	}

	/* Keywords */
	validateBasicText($validate, "keyword", "keyword", $args["keywords"], 0, 255, TRUE);
	if (!empty($args["keyword"])) {
	    $keyword = "'%" . fs_DB::$mysqli->real_escape_string(str_replace(" ", "%", $args["keyword"])) . "%'";
	    $where .= " AND ("
		    . "u.email like " . $keyword . ""
		    . ")";
	}

	if (hasError($validate)) {
	    error("Filter Validation Error", $validate);
	    return false;
	}

	//Peice SQL together
	$sql = "SELECT u.* "
		. "FROM " . USER_TABLE_SEL . " "
		. "WHERE 1=1 " . $where
		. " ORDER BY " . $sortBy . $sortDir
		. " LIMIT " . ($perpage * $pagenum) . ", " . $perpage;

	$stmt = fs_DB::prepare($sql, $validate);
	$results = fs_DB::fetch($stmt, $validate);
	if (!empty($results)) {
	    $sql = "SELECT count(1) as total "
		    . "FROM " . USER_TABLE_SEL . " "
		    . "WHERE 1=1 " . $where;
	    $stmt = fs_DB::prepare($sql, $validate);
	    $count = fs_DB::fetch($stmt, $validate);

	    $results["total"] = $count[0]["total"];
	    return $results;
	} else {
	    return array();
	}
    }

    public static function toggleUserActive($id, $active = 1, $lonetransaction = true, $validate = array()) {
	fs_Debug::log("Toggling User Active", TRACE, "ID: " . $id . " Active: " . $active);
	if (empty($id)) {
	    error("Toggle User Active", "Invalid ID: " . $id);
	    return false;
	}
	if ($id == fs_User::get("id")) {
	    error("Cannot Disable yourself silly...");
	    return false;
	}

	fs_DB::begin($lonetransaction);
	$update = array("active" => $active);
	fs_DB::updateDB_array($validate, $update, USER_TABLE, " WHERE id = " . $id);
	if (hasError($validate)) {
	    fs_DB::rollback($lonetransaction);
	    error("Error Enabling User", "", $validate);
	    return false;
	} else {
	    fs_DB::commit($lonetransaction);
	    fs_Debug::log("User Enabled/Disabled Successfully", SUCCESS);
	    return true;
	}
    }

    public static function delete($id, $loneTransaction = true, $validate = array()) {

	fs_Debug::log("Deleting User", TRACE, "ID: " . $id);

	if ($id === fs_User::get("id")) {
	    error("Cannot Delete Yourself...");
	    return false;
	}
	if (empty($id)) {
	    error("Delete User", "Invalid ID: " . $id);
	    return false;
	}

	fs_DB::begin($loneTransaction);

	fs_DB::deleteFromDB($validate, USER_TABLE, "id = " . $id);

	if (!hasError($validate)) {
	    fs_DB::commit($loneTransaction);
	    fs_Debug::log("User Deleted Successfully");
	    return true;
	} else {
	    fs_DB::rollback($loneTransaction);
	    error("User not found.", $id);
	    return false;
	}
    }

    public static function fb_login($validate = array()) {

	//Process Deauth Check
	if (!empty($_GET['fb_deauthed']) && !empty($_GET['key'])) {
	    header('Content-Type: application/json');
	    $sql = "SELECT " . USER_PREFIX . ".* "
		    . "FROM " . USER_TABLE_SEL . " "
		    . "WHERE " . USER_PREFIX . ".facebook = " . $_GET['fb_deauthed'];
	    $stmt = fs_DB::prepare($sql, $validate);
	    $result = fs_DB::fetch($stmt, $validate);
	    if (!empty($result)) {
		if (md5($result[0]["email"]) == $_GET["key"]) {
		    echo json_encode($result[0]);
		} else {
		    echo json_encode(array(
			"error" => "User Found but key does not  match"
		    ));
		}
	    } else {
		echo json_encode(array(
		    "error" => "User does not exist"
		));
	    }
	    die();
	}
	if (fs_User::isLoggedIn()) {
	    return true;
	}


	//Facebook Login
	if (isset($_GET['code']) && isset($_GET['state'])) {
	    include_once(DOCUMENT_ROOT . 'Facebook/autoload.php');
	    $fb = new Facebook\Facebook([
		'app_id' => CONFIG["facebook"]["app_id"],
		'app_secret' => CONFIG["facebook"]["app_secret"],
		'default_graph_version' => 'v4.0',
	    ]);
	    $helper = $fb->getRedirectLoginHelper();
	    $helper->getPersistentDataHandler()->set('state', $_GET['state']);

	    try {
		$accessToken = $helper->getAccessToken();
	    } catch (Facebook\Exceptions\FacebookResponseException $e) {
		// When Graph returns an error
		error('facebook', "Graph returned an error");
		fs_User::$fb_error = $e->getMessage();
		return false;
	    } catch (Facebook\Exceptions\FacebookSDKException $e) {
		// When validation fails or other local issues
		error('facebook', 'Facebook SDK returned an error');
		fs_User::$fb_error = $e->getMessage();
		return false;
	    }

	    if (!isset($accessToken)) {
		if ($helper->getError()) {
		    error('facebook', "Faceboook Login Error");
		    fs_User::$fb_error = $helper->getErrorDescription();
		    return false;
		} else {
		    error('facebook', 'Facebook Login Failed: Bad request');
		    fs_User::$fb_error = 'Bad request';
		    return false;
		}
	    }
	    //fs_Debug::log('Facebook Access Token', SUCCESS, $accessToken->getValue());
	    // The OAuth 2.0 client handler helps us manage access tokens
	    $oAuth2Client = $fb->getOAuth2Client();

	    // Get the access token metadata from /debug_token
	    $tokenMetadata = $oAuth2Client->debugToken($accessToken);
	    //fs_Debug::log('Metadata', SUCCESS, $tokenMetadata);
	    // Validation (these will throw FacebookSDKException's when they fail)
	    //$tokenMetadata->validateAppId(CONFIG["facebook"]["app_id"]); // Replace {app-id} with your app id
	    //
	    // If you know the user ID this access token belongs to, you can validate it here
	    //$tokenMetadata->validateUserId('123');
	    $tokenMetadata->validateExpiration();

	    if (!$accessToken->isLongLived()) {
		// Exchanges a short-lived access token for a long-lived one
		try {
		    $accessToken = $oAuth2Client->getLongLivedAccessToken($accessToken);
		} catch (Facebook\Exceptions\FacebookSDKException $e) {
		    error("Facebook Login Error", "<p>Error getting long-lived access token: " . $e->getMessage() . "</p>\n\n");
		    fs_User::$fb_error = $e->getMessage();
		    return false;
		}
		if (!empty($accessToken)) {
		    fs_Debug('<h3>Long-lived</h3>', SUCCESS, $accessToken);
		}
	    }

	    /**
	     * LOGIN
	     */
	    $sql = "SELECT " . USER_PREFIX . ".* "
		    . "FROM " . USER_TABLE_SEL . " "
		    . "WHERE " . USER_PREFIX . ".facebook = " . $tokenMetadata->getUserId();
	    $stmt = fs_DB::prepare($sql, $validate);
	    $result = fs_DB::fetch($stmt, $validate);
	    if (!empty($result)) {
		fs_User::loginUser(self::me(), $result[0]);
	    } else {
		try {
		    // Returns a `Facebook\FacebookResponse` object
		    $response = $fb->get('/me?fields=id,' . str_replace('user_', '', implode(",", CONFIG["facebook"]["permissions"])), $accessToken);
		} catch (Facebook\Exceptions\FacebookResponseException $e) {
		    error('facebook', "Graph returned an error");
		    fs_User::$fb_error = $e->getMessage();
		    return false;
		} catch (Facebook\Exceptions\FacebookSDKException $e) {
		    error('facebook', "Facebook SDK returned an error");
		    fs_User::$fb_error = $e->getMessage();
		    return false;
		}

		$fb_user = $response->getGraphUser();
		if (!$fb_user["email"]) {
		    $fb_user["email"] = $tokenMetadata->getUserId() . '@fracturedsupremacy.ca';
		}
		$user = array(
		    "email" => $fb_user["email"],
		    "facebook" => $tokenMetadata->getUserId(),
		    "active" => 1,
		    "options" => array(
			"Facebook User" => $response->getGraphNode()->asArray()
		    )
		);
		fs_User::create($user, $validate);
	    }
	    return true;
	}
    }

    public static function fb_deauth(&$validate = array()) {
	header('Content-Type: application/json');

	$signed_request = $_POST['signed_request'];
	$data = parse_signed_request($signed_request);
	$user_id = $data['user_id'];

	// Start data deletion
	$sql = "SELECT " . USER_PREFIX . ".* "
		. "FROM " . USER_TABLE_SEL . " "
		. "WHERE " . USER_PREFIX . ".facebook = " . $user_id;
	$stmt = fs_DB::prepare($sql, $validate);
	$result = fs_DB::fetch($stmt, $validate);
	if (!empty($result)) {
	    $status_url = ROOT_URL . '/?fb_deauthed=' . $data['user_id'] . '&key=' . md5($result[0]["email"]); // URL to track the deletion
	    $confirmation_code = $data['user_id']; // unique code for the deletion request
	    $data = array(
		'url' => $status_url,
		'confirmation_code' => $confirmation_code
	    );
	    fs_User::delete($result[0]["id"], true, $validate);
	    if (hasError($validate)) {
		echo json_encode(array(
		    "error" => "Error Deleting User",
		    "log" => $validate
		));
	    } else {
		echo json_encode($data);
	    }
	} else {
	    echo json_encode(array(
		"error" => "User does not exist"
	    ));
	}
	die();
    }

    public static function create(&$user, &$validate = array()) {

	fs_User::save($user, true, $validate);
//	print_r($validate);
	if (hasError($validate)) {
	    return false;
	}
	fs_User::loginUser(self::me(), $user);
	if (hasError($validate)) {
	    return false;
	}

	fs_Character::create($user["id"], $validate);

	return !hasError($validate);
    }

}
