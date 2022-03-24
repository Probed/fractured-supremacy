DROP TABLE IF EXISTS `acheivement`;
DROP TABLE IF EXISTS `achievement_type`;

CREATE TABLE `achievement_type` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255)  DEFAULT NULL,
  `subcat` varchar(255) DEFAULT NULL,
  `short_desc` varchar(255) DEFAULT NULL,
  `long_desc` text  DEFAULT NULL,
  `options` text  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `acheivement` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `universe_id` bigint(20) unsigned NOT NULL,
  `achievement_type_id` bigint(20) unsigned NOT NULL,
  `progress` varchar(255) NOT NULL,
  `completed` datetime DEFAULT NULL,
  `options` text NULL,
  PRIMARY KEY (`id`),
  KEY `acheivement_universe_id` (`universe_id`),
  KEY `achievement_achievement_type_id` (`achievement_type_id`),
  CONSTRAINT `acheivement_universe_id` FOREIGN KEY (`universe_id`) REFERENCES `universe` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `achievement_achievement_type_id` FOREIGN KEY (`achievement_type_id`) REFERENCES `achievement_type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

