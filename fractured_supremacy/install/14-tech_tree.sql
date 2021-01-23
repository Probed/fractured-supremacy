DROP TABLE IF EXISTS `tech_tree`;
DROP TABLE IF EXISTS `tech_tree_type`;

CREATE TABLE `tech_tree_type` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(255)  DEFAULT NULL,
  `category` varchar(255)  DEFAULT NULL,
  `subcat` varchar(255)  DEFAULT NULL,
  `short_desc` varchar(255)  DEFAULT NULL,
  `long_desc` text  DEFAULT NULL,
  `options` text  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `tech_tree` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `universe_id` bigint(20) unsigned NOT NULL,
  `tech_tree_type_id` bigint(20) unsigned NOT NULL,
  `progress` text,
  `completed` datetime DEFAULT NULL,
  `options` text NULL,
  PRIMARY KEY (`id`),
  KEY `tech_tree_universe_id` (`universe_id`),
  KEY `tech_tree_tech_tree_type_id` (`tech_tree_type_id`),
  CONSTRAINT `tech_tree_universe_id` FOREIGN KEY (`universe_id`) REFERENCES `universe` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tech_tree_tech_tree_type_id` FOREIGN KEY (`tech_tree_type_id`) REFERENCES `tech_tree_type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


