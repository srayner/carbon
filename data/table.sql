-- Category table
DROP TABLE IF EXISTS category;
CREATE TABLE category
(
    id           smallint unsigned    NOT NULL auto_increment,
    title        varchar(255)         NOT NULL,
    show_in_menu smallint unsigned    NOT NULL,
    PRIMARY KEY (id)
);

-- Article table
DROP TABLE IF EXISTS article;
CREATE TABLE article
(
    id              smallint unsigned NOT NULL auto_increment,
    publicationDate date              NOT NULL,
    title           varchar(255)      NOT NULL,
    summary         text              NOT NULL,
    content         mediumtext        NOT NULL,
    PRIMARY KEY (id)
);