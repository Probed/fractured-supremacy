DROP TABLE IF EXISTS `alliance_tournement_particpamt`;
DROP TABLE IF EXISTS `alliance_tournement_reward`;
DROP TABLE IF EXISTS `alliance_tournement`;
DROP TABLE IF EXISTS `alliance_member`;
DROP TABLE IF EXISTS `alliance`;
DROP TABLE IF EXISTS `alliance_role`;

CREATE TABLE `alliance_role` (
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

CREATE TABLE `alliance` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `owner_universe_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `alliance_universe_id` (`owner_universe_id`),
  CONSTRAINT `alliance_universe_id` FOREIGN KEY (`owner_universe_id`) REFERENCES `universe` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `alliance_member` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `alliance_id` bigint(20) unsigned NOT NULL,
  `universe_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL DEFAULT '0',
  `joined` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `alliance_member_alliance_id` (`alliance_id`),
  KEY `alliance_membr_universe_id` (`universe_id`),
  KEY `alliance_member_role_id` (`role_id`),
  CONSTRAINT `alliance_member_alliance_id` FOREIGN KEY (`alliance_id`) REFERENCES `alliance` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `alliance_membr_universe_id` FOREIGN KEY (`universe_id`) REFERENCES `universe` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `alliance_member_role_id` FOREIGN KEY (`role_id`) REFERENCES `alliance_role` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `alliance_tournement` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `team1` bigint(20) unsigned DEFAULT NULL,
  `team2` bigint(20) unsigned DEFAULT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `alliance_tournement_team1_id` (`team1`),
  KEY `alliance_tournement_team2_id` (`team2`),
  CONSTRAINT `alliance_tournement_team1_id` FOREIGN KEY (`team1`) REFERENCES `alliance` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `alliance_tournement_team2_id` FOREIGN KEY (`team2`) REFERENCES `alliance` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `alliance_tournement_particpamt` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tournement_id` bigint(20) unsigned NOT NULL,
  `universe_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `participant_tournement_id` (`tournement_id`),
  KEY `participant_universe_id` (`universe_id`),
  CONSTRAINT `participant_tournement_id` FOREIGN KEY (`tournement_id`) REFERENCES `alliance_tournement` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `participant_universe_id` FOREIGN KEY (`universe_id`) REFERENCES `universe` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `alliance_tournement_reward` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `alliance_tournement_participant_id` bigint(20) unsigned NOT NULL,
  `resource_type_id` bigint(20) unsigned NOT NULL,
  `qty` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `alliance_tournement_reward_participant_id` (`alliance_tournement_participant_id`),
  KEY `alliance_tournement_reward_resource_type_id` (`resource_type_id`),
  CONSTRAINT `alliance_tournement_reward_participant_id` FOREIGN KEY (`alliance_tournement_participant_id`) REFERENCES `alliance_tournement_particpamt` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `alliance_tournement_reward_resource_type_id` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

