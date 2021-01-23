DROP TABLE IF EXISTS `platform_type`;
DROP TABLE IF EXISTS `platform`;

CREATE TABLE `platform_type` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(255)  DEFAULT NULL,
  `category` varchar(255)  DEFAULT NULL,
  `subcat` varchar(255)  DEFAULT NULL,
  `short_desc` varchar(255) DEFAULT NULL,
  `long_desc` text DEFAULT NULL,
  `options` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `platform` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `satellite_id` bigint(20) unsigned NOT NULL,
  `platform_type_id` bigint(20) unsigned NOT NULL,
  `options` text NULL,
  PRIMARY KEY (`id`),
  KEY `platform_satalite_id` (`satellite_id`),
  KEY `platform_platform_type_id` (`platform_type_id`),
  CONSTRAINT `platform_satalite_id` FOREIGN KEY (`satellite_id`) REFERENCES `satellite` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `platform_platform_type_id` FOREIGN KEY (`platform_type_id`) REFERENCES `platform_type` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
