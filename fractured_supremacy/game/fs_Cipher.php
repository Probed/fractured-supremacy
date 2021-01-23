<?php

class fs_Cipher {

    private $iv, $key, $cipher = "AES-256-CBC";

    function __construct($key, $iv = null) {
	$this->key = $key;
	$this->iv = $iv;
    }

    function encrypt($plaintext) {
	if (empty($plaintext)) {
	    return false;
	}
	$key = hash('sha256', $this->key, true);
	if (!$this->iv) {
	    $iv = openssl_random_pseudo_bytes(16);
	} else {
	    $iv = $this->iv;
	}
	$ciphertext = openssl_encrypt($plaintext, $this->cipher, $key, OPENSSL_RAW_DATA, $iv);
	$hash = hash_hmac('sha256', $ciphertext . $iv, $key, true);
	//echo "<br>IV: $iv<br/>Key: $this->key<br/>Hash: $hash<br/>";
	return base64_encode($iv . $hash . $ciphertext);
    }

    function decrypt($ivHashCiphertext) {
	if (empty($ivHashCiphertext)) {
	    return false;
	}
	$ivHashCiphertext = base64_decode($ivHashCiphertext);
	if (!$this->iv) {
	    $iv = substr($ivHashCiphertext, 0, 16);
	} else {
	    $iv = $this->iv;
	}
	$hash = substr($ivHashCiphertext, 16, 32);
	$ciphertext = substr($ivHashCiphertext, 48);
	$key = hash('sha256', $this->key, true);
	//echo "<br>IV: $iv<br/>Key: $key<br/>Hash: $hash<br/>";
	if (!hash_equals(hash_hmac('sha256', $ciphertext . $iv, $key, true), $hash))
	    return null;

	return openssl_decrypt($ciphertext, $this->cipher, $key, OPENSSL_RAW_DATA, $iv);
    }

}

?>
