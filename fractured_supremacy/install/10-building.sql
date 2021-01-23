DROP TABLE IF EXISTS `building_inhabitant`;
DROP TABLE IF EXISTS `building_type`;
DROP TABLE IF EXISTS `building`;

CREATE TABLE `building_type` (
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

CREATE TABLE `building` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `building_type_id` bigint(20) unsigned NOT NULL,
  `platform_id` bigint(20) unsigned NOT NULL,
  `options` text NULL,
  PRIMARY KEY (`id`),
  KEY `building_building_type_id` (`building_type_id`),
  KEY `building_platform_id` (`platform_id`),
  CONSTRAINT `building_building_type_id` FOREIGN KEY (`building_type_id`) REFERENCES `building_type` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `building_platform_id` FOREIGN KEY (`platform_id`) REFERENCES `platform` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `building_inhabitant` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `inhabitant_id` bigint(20) unsigned NOT NULL,
  `building_id` bigint(20) unsigned NOT NULL,
  `options` text NULL,
  PRIMARY KEY (`id`),
  KEY `building_inhabitant_building_id` (`building_id`),
  KEY `building_inhabitant_inhabitant_id` (`inhabitant_id`),
  CONSTRAINT `building_inhabitant_building_id` FOREIGN KEY (`building_id`) REFERENCES `building` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `building_inhabitant_inhabitant_id` FOREIGN KEY (`inhabitant_id`) REFERENCES `inhabitant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
