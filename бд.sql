-- СУБД: mysql
-- создание базы данных
CREATE DATABASE `librarybd`

-- создание таблицы пользователей
CREATE TABLE `librarybd`.`users`
(
    `id` INT NOT NULL AUTO_INCREMENT,
    `login` VARCHAR(128) NOT NULL UNIQUE,
    `password` VARCHAR(128) NOT NULL,
    `role` VARCHAR(10) NOT NULL DEFAULT 'user',
    PRIMARY KEY(`id`)
)
ENGINE = InnoDB;

-- создание таблицы сессий
CREATE TABLE `librarybd`.`sessions`
(
    `id` INT NOT NULL AUTO_INCREMENT,
    `session` VARCHAR(128) NOT NULL UNIQUE,
    `user_id` INT NOT NULL,
    PRIMARY KEY(`id`)
)
ENGINE = InnoDB;

-- создание таблицы книг
CREATE TABLE `librarybd`.`books`
(
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, 
    `name` VARCHAR(128) NOT NULL, 
    `author` VARCHAR(128) NOT NULL, 
    `img` VARCHAR(256) NOT NULL DEFAULT '/img/no-photo.jpg', 
    `link` VARCHAR(256) NOT NULL 
)
ENGINE = InnoDB

-- cоздание учетки админа
INSERT INTO `users`(`login`, `password`, `role`) VALUES ('admin', '21232f297a57a5a743894a0e4a801fc3', 'admin')

-- первичная инициализация книг
INSERT INTO `books`(`name`, `author`, `img`, `link`) VALUES 
('1984', 'Д. ОРУЭЛЛ', '/img/1.jpg', '/books/1.pdf'),
('Эшелон на Самарканд', 'Яхина Г.', '/img/2.jpg', '/books/2.pdf'),
('Колесо Времени. Книга 5. Огни небес', 'Джордан Р.', '/img/3.jpg', '/books/3.pdf'),
('Ловец видений', 'Лукьяненко С.', '/img/4.jpg', '/books/4.pdf'),
('Управляй играя', 'Друтько В.', '/img/5.jpg', '/books/5.pdf'),
('Фейсбук русской революции', 'Зыгарь М.', '/img/6.jpg', '/books/6.pdf'),
('Лекарство для империи', 'Акунин Б.', '/img/7.jpg', '/books/7.pdf'),
('Думай как монах. Прокачай свою жизнь', 'Шетти Джей', '/img/8.jpg', '/books/8.pdf'),
('Вольному - воля. Путешествия по диким', 'Акунин Б.', '/img/9.jpg', '/books/9.pdf'),
('Король Воронов', 'Сакавич Н.', '/img/10.jpg', '/books/10.pdf')