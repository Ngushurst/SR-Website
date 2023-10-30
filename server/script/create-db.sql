CREATE DATABASE IF NOT EXISTS summit_reviews;
USE summit_reviews;
CREATE TABLE IF NOT EXISTS article(
	id int NOT NULL AUTO_INCREMENT,
	title varchar(128) NOT NULL,
	created_by int NOT NULL,
	created_on datetime NOT NULL,
    file_id int NOT NULL,
	published tinyint NOT NULL,
	published_on datetime,
	summary varchar(256),
	metadata json,
	tags varchar(128),
	PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS article_history(
	id int NOT NULL AUTO_INCREMENT,
    article_id int NOT NULL,
	version smallint NOT NULL,
	action varchar(16) NOT NULL,
	changed_by int NOT NULL,
	changed_on datetime NOT NULL,
	title varchar(128),
	created_by int,
	created_on datetime,
    file_id int,
	published tinyint,
	published_on datetime,
	summary varchar(256),
	metadata json,
	tags varchar(128),
	PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS category(
	id integer NOT NULL AUTO_INCREMENT,
	format varchar(32) NOT NULL,
	name varchar(32) NOT NULL,
	type varchar(16) NOT NULL,
	parent_category int NOT NULL,
    priority int DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS category_history(
	id integer NOT NULL AUTO_INCREMENT,
    category_id int NOT NULL,
	version smallint NOT NULL,
	action varchar(16) NOT NULL,
	changed_by int NOT NULL,
	changed_on datetime NOT NULL,
	format varchar(32),
	name varchar(32),
	type varchar(16),
	parent_category int,
    priority int,
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS file(
	id int NOT NULL AUTO_INCREMENT,
    handle varchar(256) NOT NULL,
    filename varchar(256) NOT NULL,
    size int NOT NULL,
    type varchar(16) NOT NULL,
    PRIMARY KEY(id)
);
CREATE TABLE IF NOT EXISTS password_reset(
	id int NOT NULL AUTO_INCREMENT,
    user_id int NOT NULL,
    reset_code varchar(8) NOT NULL,
    created_on datetime NOT NULL,
    PRIMARY KEY(id)
);
CREATE TABLE IF NOT EXISTS role(
	id integer NOT NULL AUTO_INCREMENT,
    name varchar(64) NOT NULL,
    privileges varchar(512) NOT NULL,
    description varchar(512),
    PRIMARY KEY(id)
);
CREATE TABLE IF NOT EXISTS role_history(
	id int NOT NULL AUTO_INCREMENT,
	role_id int NOT NULL,
    action varchar(16) NOT NULL,
    changed_by datetime NOT NULL,
    changed_on datetime NOT NULL,
    name varchar(64),
    privileges varchar(512),
    description varchar(512),
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS tag(
	id int NOT NULL AUTO_INCREMENT,
    name varchar(64) NOT NULL,
    PRIMARY KEY(id)
);
CREATE TABLE IF NOT EXISTS user(
	id int NOT NULL AUTO_INCREMENT,
    email varchar(256) NOT NULL,
    name varchar(128) NOT NULL,
    password varchar(64) NOT NULL,
    status varchar(16) NOT NULL,
    roles varchar(64),
    resource_id int,
    auto_biography_id int,
    PRIMARY KEY(id)
);
CREATE TABLE IF NOT EXISTS user_history(
	id int NOT NULL AUTO_INCREMENT,
    version smallint NOT NULL,
    user_id int NOT NULL,
    action int NOT NULL,
    changed_by datetime NOT NULL,
    changed_on datetime NOT NULL,
    email varchar(256),
    name varchar(128),
    password varchar(64),
    status varchar(16),
    roles varchar(64),
    resource_id int,
    auto_biography_id int,
    PRIMARY KEY(id)
);
