DROP TABLE IF EXISTS `universe`;
CREATE TABLE `universe` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `character_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `frequency` varchar(255) NOT NULL,
  `options` text,
  PRIMARY KEY (`id`),
  KEY `universe_character_id` (`character_id`),
  CONSTRAINT `universe_character_id` FOREIGN KEY (`character_id`) REFERENCES `fs_character` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;