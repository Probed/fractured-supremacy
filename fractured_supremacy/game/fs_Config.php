<?php

define('CONFIG', array(
    "title" => "Fractured Supremacy",
    "version" => "0.1",
    "email" => array(
	"from" => "tsmedes@slandstudios.com",
	"reply" => "tsmedes@slandstudios.com",
	"return" => "tsmedes@slandstudios.com",
	"footer" => "<hr>Email:<br/>Phone:<br/>Website<br/>" . "Fractured Supremacy"
    ),
    "facebook" => array(
	"app_id" => "1328660910635062",
	"app_secret" => "f1005c7336b6aa5992cc81f28bd80e45",
	"permissions" => [
	    'email',
//	    "user_photos",
//	    'user_age_range',
//	    'user_birthday',
//	    'user_friends',
//	    "user_gender",
//	    "user_hometown",
//	    "user_link",
//	    "user_location"
	]
    ),
    "image_types" => array(
	/* Images */
	"image/bmp",
	"image/jpg",
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/tif",
	"image/tiff"
    )
));

define("SANATIZE", array("iv"));
