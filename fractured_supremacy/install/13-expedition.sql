DROP TABLE IF EXISTS `expedition_reward`;
DROP TABLE IF EXISTS `expedition_member`;
DROP TABLE IF EXISTS `expedition`;
DROP TABLE IF EXISTS `expedition_type`;

CREATE TABLE `expedition_type` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nanme` varchar(255) NOT NULL,
  `type` varchar(255)  DEFAULT NULL,
  `category` varchar(255)  DEFAULT NULL,
  `subcat` varchar(255)  DEFAULT NULL,
  `short_desc` varchar(255)  DEFAULT NULL,
  `long_desc` text  DEFAULT NULL,
  `options` datetime  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `expedition` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `universe_id` bigint(20) unsigned DEFAULT NULL,
  `expedition_type_id` bigint(20) unsigned NOT NULL,
  `options` text NULL,
  PRIMARY KEY (`id`),
  KEY `expedition_universe_id` (`universe_id`),
  KEY `expedition_expedition_type_id` (`expedition_type_id`),
  CONSTRAINT `expedition_universe_id` FOREIGN KEY (`universe_id`) REFERENCES `universe` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `expedition_expedition_type_id` FOREIGN KEY (`expedition_type_id`) REFERENCES `expedition_type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `expedition_member` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `inhabitant_id` bigint(20) unsigned NOT NULL,
  `expedition_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `expedition_member_inhabitant_id` (`inhabitant_id`),
  KEY `expedition_member_expedition_id` (`expedition_id`),
  CONSTRAINT `expedition_member_inhabitant_id` FOREIGN KEY (`inhabitant_id`) REFERENCES `inhabitant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `expedition_member_expedition_id` FOREIGN KEY (`expedition_id`) REFERENCES `expedition` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `expedition_reward` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `expedition_member_id` bigint(20) unsigned NOT NULL,
  `resource_type_id` bigint(20) unsigned NOT NULL,
  `qty` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expedition_results_expedition_member_id` (`expedition_member_id`),
  KEY `expedition_reward_resource_type_id` (`resource_type_id`),
  CONSTRAINT `expedition_results_expedition_member_id` FOREIGN KEY (`expedition_member_id`) REFERENCES `expedition_member` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `expedition_reward_resource_type_id` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

