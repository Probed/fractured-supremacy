DROP TABLE IF EXISTS `celestial_object`;
DROP TABLE IF EXISTS `celestial_object_type`;

CREATE TABLE `celestial_object_type` (
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

CREATE TABLE `celestial_object` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `celestial_object_type_id` bigint(20) unsigned NOT NULL,
  `universe_id` bigint(20) unsigned NOT NULL,
  `options` text NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `celestial_object_universe_id` (`universe_id`),
  KEY `celestial_object_celestial_object_type_id` (`celestial_object_type_id`),
  CONSTRAINT `celestial_object_universe_id` FOREIGN KEY (`universe_id`) REFERENCES `universe` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `celestial_object_celestial_object_type_id` FOREIGN KEY (`celestial_object_type_id`) REFERENCES `celestial_object_type` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
