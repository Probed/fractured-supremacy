DROP TABLE IF EXISTS `satellite_type`;
DROP TABLE IF EXISTS `satellite`;

CREATE TABLE `satellite_type` (
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

CREATE TABLE `satellite` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `celestial_object_id` bigint(20) unsigned NOT NULL,
  `satellite_type_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `options` text NULL,
  PRIMARY KEY (`id`),
  KEY `satellite_celestial_object_id` (`celestial_object_id`),
  KEY `satellite_satellite_type_id` (`satellite_type_id`),
  CONSTRAINT `satellite_celestial_object_id` FOREIGN KEY (`celestial_object_id`) REFERENCES `celestial_object` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `satellite_satellite_type_id` FOREIGN KEY (`satellite_type_id`) REFERENCES `satellite_type` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
