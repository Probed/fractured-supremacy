DROP TABLE IF EXISTS `inhabitant_item`;
DROP TABLE IF EXISTS `inhabitant_type`;
DROP TABLE IF EXISTS `inhabitant`;

CREATE TABLE `inhabitant_type` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `subcat` varchar(255) DEFAULT NULL,
  `short_desc` varchar(255) DEFAULT NULL,
  `long_desc` text DEFAULT NULL,
  `options` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `inhabitant` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `universe_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `specialty` varchar(255) NOT NULL,
  `options` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inhabitant_universe_id` (`universe_id`),
  CONSTRAINT `inhabitant_universe_id` FOREIGN KEY (`universe_id`) REFERENCES `universe` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `inhabitant_item` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `inhabitant_id` bigint(20) unsigned NOT NULL,
  `item_store_id` bigint(20) unsigned NOT NULL,
  `slot` int(11) DEFAULT NULL,
  `options` text NULL,
  PRIMARY KEY (`id`),
  KEY `inhabitant_item_inhabitant_id` (`inhabitant_id`),
  KEY `inhabitant_item_item_store_id` (`item_store_id`),
  CONSTRAINT `inhabitant_item_inhabitant_id` FOREIGN KEY (`inhabitant_id`) REFERENCES `inhabitant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inhabitant_item_item_store_id` FOREIGN KEY (`item_store_id`) REFERENCES `item_store` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

