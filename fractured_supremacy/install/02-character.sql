DROP TABLE IF EXISTS `fs_character`;

CREATE TABLE `fs_character` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `active` tinyint(3) unsigned NOT NULL DEFAULT '1',
  `xp` bigint(20) unsigned NOT NULL DEFAULT '0',
  `options` text,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `character_user_id` (`user_id`),
  CONSTRAINT `character_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;