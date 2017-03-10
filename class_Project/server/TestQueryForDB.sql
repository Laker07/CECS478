use ServerDB;

INSERT INTO users (username, password) VALUES
("bob23", "123"),
("smith12", "abc"),
("joe42", "hello");


SELECT * FROM users;


INSERT INTO messages(username, receiverName, message) VALUES
("bob23", "smith12", "Hello smith12"),
("bob23", "smith12", "did you get my message?"),
("smith12", "bob23", "yes I did");

SELECT * FROM messages;

SELECT * FROM messages
WHERE receiverName="smith12";

INSERT INTO messages(username, receiverName, message) VALUES
('joe42', 'joe42', "delete me");

DELETE FROM messages
WHERE receiverName="joe42";

INSERT INTO messages(username, receiverName, message) VALUES
("bob23", "smith12", "did you get my message?"),
("smith12", "bob23", "yes I did");