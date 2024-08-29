// init-mongo.js

db = db.getSiblingDB('shopper'); // Switch to the shopper database

// Create collections and insert initial data

// Add more collections and initial data as needed
db = db.getSiblingDB('shopper')

db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [
    {
      role: 'root',
      db: 'admin',
    },
  ],
});