create table users (
   id INT PRIMARY KEY auto_increment NOT NULL,
   email VARCHAR
(255) UNIQUE,
   password VARCHAR
(255),
   google_id VARCHAR
(255) UNIQUE,
   google_email VARCHAR
(255) UNIQUE,
   facebook_id VARCHAR
(255) UNIQUE,
   facebook_email VARCHAR
(255) UNIQUE
   )

