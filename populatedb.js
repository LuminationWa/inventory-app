#! /usr/bin/env node

console.log(
  "This script populates your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/?retryWrites=true&w=majority"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Item = require("./models/item");
var Category = require("./models/category");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var items = [];
var categories = [];

function categoryCreate(name, description, cb) {
  categorydetail = { name: name, description: description };
  var category = new Category(categorydetail);

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(name, description, category, price, stock, cb) {
  itemdetail = {
    name: name,
    description: description,
    category: category,
    price: price,
    stock: stock,
  };

  var item = new Item(itemdetail);
  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Item: " + item);
    items.push(item);
    cb(null, item);
  });
}

function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate("Clothing", "Men's, women's, and children's clothing, as well as items such as shoes, accessories, and jewelry.", callback);
      },
      function (callback) {
        categoryCreate("Electronics", "Items such as smartphones, computers, televisions, and other consumer electronics.", callback);
      },
      function (callback) {
        categoryCreate("Household items", "Items such as furniture, bedding, kitchenware, and home decor.", callback);
      },
      function (callback) {
        categoryCreate("Sporting items", "Items such as athletic equipment, bicycles, and outdoor gear.", callback);
      },
      function (callback) {
        categoryCreate("Beauty and Personal Care", "Items such as makeup, skincare, haircare and grooming products.", callback);
      },
      function (callback) {
        categoryCreate("Food and Beverages", "Items such as snacks, packaged food items, and beverages.", callback);
      },
      function (callback) {
        categoryCreate("Books and Media", "Items such as books, music, movies, and games.", callback);
      },
      function (callback) {
        categoryCreate("Toys and Hobbies", "Items such as action figures, board games, and craft supplies.", callback);
      },
    ],
    // optional callback
    cb
  );
}

function createItems(cb) {
  async.parallel(
    [
      function (callback) {
        itemCreate(
          "Men's Denim Jacket",
          "A classic men's denim jacket featuring a button-front design and multiple pockets.",
          categories[0],
          40,
          73,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Samsung Galaxy S20 5G",
          "A 5G-enabled smartphone featuring a 6.2-inch display, triple rear camera, and long-lasting battery life.",
          categories[1],
          800,
          34,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Memory Foam Pillow",
          "A memory foam pillow that conforms to the shape of your head and neck for optimal support and comfort.",
          categories[2],
          20,
          59,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Wilson Pro Staff Tennis Racket",
          "A high-performance tennis racket designed for advanced players with a lightweight and balanced frame.",
          categories[3],
          200,
          87,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "L'Oreal Paris Elvive Total Repair 5 Shampoo",
          "A nourishing shampoo that repairs and fortifies damaged hair.",
          categories[4],
          8,
          12,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Organic Fair Trade Dark Chocolate",
          "A rich, organic and fair trade dark chocolate with a deep and complex flavor profile.",
          categories[5],
          12,
          68,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Harry Potter and the Sorcerer's Stone",
          "The first book in the best-selling Harry Potter series, describing the adventures of a young wizard named Harry Potter.",
          categories[6],
          15,
          43,
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createCategories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("Categories: " + categories);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
