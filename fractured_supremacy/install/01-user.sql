DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(75) NULL,
  `password` varchar(255) NULL,
  `active` tinyint(3) unsigned NOT NULL DEFAULT '1',
  `facebook` varchar(255) NULL,
  `google` varchar(255) NULL,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `options` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;