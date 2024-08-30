// init-mongo.js

db = db.getSiblingDB('shopper')

// Create collections and insert initial data

db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [
    {
      role: 'root',
      db: 'admin',
    },
  ],
})

