CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fname VARCHAR(50),
    lname VARCHAR(50),
    username VARCHAR(50) UNIQUE,
    country VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    newsletter boolean
);

CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    name VARCHAR(100),
    title VARCHAR(100),
    date DATE,
    body TEXT
);