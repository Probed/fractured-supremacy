DROP TABLE IF EXISTS `resource`;
DROP TABLE IF EXISTS `resource_type`;

CREATE TABLE `resource_type` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `subcat` varchar(255) DEFAULT NULL,
  `short_desc` varchar(255) DEFAULT NULL,
  `long_desc` text DEFAULT NULL,
  `options` text NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `resource` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `resource_type_id` bigint(20) unsigned NOT NULL,
  `universe_id` bigint(20) unsigned NOT NULL,
  `qty` int(10) unsigned NOT NULL DEFAULT '0',
  `options` text NULL,
  PRIMARY KEY (`id`),
  KEY `resource_resource_type_id` (`resource_type_id`),
  KEY `resource_universe_id` (`universe_id`),
  CONSTRAINT `resource_resource_type_id` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_type` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `resource_universe_id` FOREIGN KEY (`universe_id`) REFERENCES `universe` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
