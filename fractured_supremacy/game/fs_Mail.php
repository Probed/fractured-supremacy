<?php

class fs_Mail {

    private static $mail_queue = array();

    public static function queue_mail($to, $subject, $message, $additional_headers = "", $additional_parameters = null) {
	$ret = array(
	    "to" => $to,
	    "subject" => $subject,
	    "message" => $message,
	    "additional_headers" => $additional_headers,
	    "additional_parameters" => $additional_parameters
		//"additional_parameters" => '-f' . EMAIL_FROM . ' ' . $additional_parameters
	);
	fs_Debug::log("Adding mail #" . (count(fs_Mail::$mail_queue) + 1) . " to mail queue. ", TRACE);
	array_push(fs_Mail::$mail_queue, $ret);
	return $ret;
    }

    public static function clear_mail_queue() {
	fs_Debug::log("Clearing " . count(fs_Mail::$mail_queue) . " items from mail queue.", TRACE);
	fs_Mail::$mail_queue = array();
    }

    public static function send_mail_queue() {

	if (!empty(fs_Mail::$mail_queue)) {
	    fs_Debug::log("Sending Mail Queue " . count(fs_Mail::$mail_queue) . " Items", TRACE);
	    foreach (fs_Mail::$mail_queue as $key => $value) {
		if (!empty($value["to"]) && !empty($value["subject"]) && !empty($value["message"])) {
		    fs_Debug::log("Sending Mail Queue Item #" . ($key + 1) . ' to: ' . $value["to"], TRACE);
		    $headers = "Organization: " . CONFIG["title"] . "\r\n";
		    $headers .= "MIME-Version: 1.0" . "\r\n";
		    $headers .= "Content-type: text/html; charset=iso-8859-1" . "\r\n";
		    $headers .= "From: " . CONFIG["email"]["from"] . "\r\n" .
			    "Reply-To: " . CONFIG["email"]["reply"] . "" . "\r\n" .
			    "Return-Path: " . CONFIG["email"]["return"] . "\r\n" .
			    "X-Priority: 3\r\n" .
			    "X-Mailer: PHP/" . phpversion();
		    mail($value["to"], $value["subject"], $value["message"], $headers . $value["additional_headers"], $value["additional_parameters"]);
		} else {
		    fs_Debug::log("Mail Missing Values", ERROR, $value);
		}
	    }
	    fs_Mail::clear_mail_queue();
	}
    }

}
