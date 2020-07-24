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


UPDATE users SET google_id='22skfjsdkk', google_email='rihan3011@gmail.com' WHERE email = 'rihan3011@gmail.com';


SELECT *
from users
WHERE email = 'rihan301@gmail.com' AND google_id = '1m1m1m11m ';


UPDATE users SET google_id = '112292685882967849011', google_email = 'rihan.taher@gmail.com WHERE
(SELECT * FROM users WHERE  email = 'rihan.taher@gmail.com'|| google_email = '
rihan.taher@gmail.com' || facebook_email = 'rihan.taher@gmail.com')

UPDATE users SET google_id = '112292685882967849011', google_email = 'rihan.taher@gmail.com WHERE email = 'rihan.taher@gmail.com'|| google_email = 'rihan.taher@gmail.com' || facebook_email = 'rihan.taher@gmail.com';