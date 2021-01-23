DROP TABLE IF EXISTS `item_type`;
DROP TABLE IF EXISTS `item`;

CREATE TABLE `item_type` (
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

CREATE TABLE `item` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `item_type_id` bigint(20) unsigned NOT NULL,
  `universe_id` bigint(20) unsigned NOT NULL,
  `qty` int(10) unsigned NOT NULL DEFAULT '0',
  `options` text NULL,
  PRIMARY KEY (`id`),
  KEY `item_item_type_id` (`item_type_id`),
  KEY `item_universe_id` (`universe_id`),
  CONSTRAINT `item_item_type_id` FOREIGN KEY (`item_type_id`) REFERENCES `item_type` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `item_universe_id` FOREIGN KEY (`universe_id`) REFERENCES `universe` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
