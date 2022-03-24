<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information
 * by visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'stagings_fs');

/** MySQL database username */
define('DB_USER', 'stagings_fsmysql');

/** MySQL database password */
define('DB_PASSWORD', '!2{%kxqI?B^A');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'j8:LEHfR}S}l-G(vPE94z6v_RjnpczI5~WT}HbV7p u8E|M(+#Zd)p5~ 9@xuwcQ');
define('SECURE_AUTH_KEY',  '_jO(YG[LtM?iAV=!~$pX:,>.jc<Flt<}IX[gYkt|0R&(s]/ElG0OOaftc!<j51YG');
define('LOGGED_IN_KEY',    '*1)S|,s*._g}/t[R+=XgvHMF-c|RnpLIes6+a$HZ((asFO<hLKUb<1(;+cDX9wbU');
define('NONCE_KEY',        '2ih1SK$zFJE:wPZ,g1M5OzvxV~&kN+o^Z2au}w+S=AFnzF+vBiht*zX.zIE~Ewi4');
define('AUTH_SALT',        'KB~cZYWlvH<EyByRi^Qls&w}-1C W>YS-c[9H5.~,J5v6fD`]>H~z2(GT4|P(Ke.');
define('SECURE_AUTH_SALT', '<|j6pHXl)`;DZ=wH4aKCUcQ>vT5Y?HmVnW:e*0&_7KNcMnr*R-n0-mxd{NAf}VC3');
define('LOGGED_IN_SALT',   'L5TdZ`L#BPy*gQ@6ntkxBAP8%0f#pjXdPXz!GOIY3{Q&}A-pd$J475)C#>OX+xa@');
define('NONCE_SALT',       'eJwm-Xm*W 3eOR$4w_[b+kk:MlPq4ML0K9gox4~SqYNhF}C$nPY #-AS|v&v!,bO');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_fs_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress. A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de_DE.mo to wp-content/languages and set WPLANG to 'de_DE' to enable German
 * language support.
 */
define('WPLANG', '');

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);
define('WP_DEBUG_DISPLAY', false);

/* That's all, stop editing! Happy blogging. */
if ( defined('DOCUMENT_ROOT') ) {
    return;
}

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');