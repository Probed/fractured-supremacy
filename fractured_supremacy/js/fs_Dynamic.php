<?php
$out = array(
    "title" => CONFIG["title"],
    "version" => CONFIG["version"],
    "root_url" => ROOT_URL,
    "ajax_url" => ROOT_URL . '/index.php?xhr=true',
	//"debug" => fs_Debug::out()
);
?>
var DEBUG = true;
var CONFIG = <?= json_encode($out) ?>;

<?php
if (fs_User::isLoggedIn()) {
    $validate = $v;
    $uni = fs_Character::build_universe($user["id"], $character["id"],$v);
    cleanArray($uni, SANATIZE);
    ?>
    var TYPES = <?= json_encode(fs_TypeTable::allTypes()) ?>;
    var UNIVERSE = <?= json_encode($uni); ?>;
    <?php
}
?>
var app = null;
var debug = null;
window.addEvent('domready', function() {
debug = new fs_Debug();
<?php
if (!fs_User::isLoggedIn()) {
    include_once(DOCUMENT_ROOT . 'Facebook/autoload.php');
    $fb = new Facebook\Facebook([
	'app_id' => CONFIG["facebook"]["app_id"],
	'app_secret' => CONFIG["facebook"]["app_secret"],
	'default_graph_version' => 'v3.2',
    ]);

    $helper = $fb->getRedirectLoginHelper();

    $permissions = CONFIG["facebook"]["permissions"]; // Optional permissions
    $loginUrl = $helper->getLoginUrl(url_origin($_SERVER) . '/fs/fractured_supremacy/index.php', $permissions);

    $userOptions = array(
	"fb" => $loginUrl,
	"fb_error" => fs_User::$fb_error,
	    )
    ?>
    $(document.body).store('fs_UserLogin',app = new fs_UserLogin(<?= json_encode($userOptions) ?>));
    $$('.page-wrapper').adopt($(document.body).retrieve('fs_UserLogin').toElement());
    $(document.body).retrieve('fs_UserLogin').open();
    <?php
} else {
    if (isset($_GET["builder"])) {
	?>

	<?php
    } else {
	?>
	$(document.body).store('fs_Main',app = new fs_Main());
	$$('.page-wrapper').adopt($(document.body).retrieve('fs_Main').toElement());
	$(document.body).retrieve('fs_Main').start();
	<?php
    }
}
?>
});

