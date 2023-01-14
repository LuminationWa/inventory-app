const Item = require("../models/item");
const Category = require("../models/category");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = (req, res) => {
  async.parallel(
    {
      item_count(callback) {
        Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      category_count(callback) {
        Category.countDocuments({}, callback);
      },
      stock_count(callback) {
        Item.aggregate(
          [
            {
              $group: {
                _id: null,
                totalStock: { $sum: "$stock" },
              },
            },
          ],
          callback
        );
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all Items.
exports.item_list = (req, res, next) => {
  Item.find({}, "category name")
    .sort({ name: 1 })
    .populate("category")
    .exec(function (err, list_items) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      console.log(list_items);
      res.render("item_list", { title: "Item List", item_list: list_items });
    });
};

// Display detail page for a specific Item.
exports.item_detail = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).populate("category").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      console.log(results.item.category[0].name);
      res.render("item_detail", {
        name: results.item.name,
        item: results.item,
        categories: results.item.category,
      });
    }
  );
};

// Display Item create form on GET.
exports.item_create_get = (req, res, next) => {
  // Get all categories, which we can use for adding to our book.
  async.parallel(
    {
      category(callback) {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("item_form", {
        title: "Create new Item",
        categories: results.category,
      });
    }
  );
};

// Handle Item create on POST.
exports.item_create_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("stock", "Stock must not be empty").trim().isLength({ min: 1 }).escape(),
  body("category.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          category(callback) {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const category of results.category) {
            if (item.category.includes(category._id)) {
              category.checked = "true";
            }
          }
          res.render("item_form", {
            title: "Create Item",
            categories: results.category,
            item,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save item.
    item.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new item record.
      res.redirect(item.url);
    });
  },
];

// Display Item delete form on GET.
exports.item_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Item delete GET");
};

// Handle Item delete on POST.
exports.item_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Item delete POST");
};

// Display Item update form on GET.
exports.item_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Item update GET");
};

// Handle Item update on POST.
exports.item_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Item update POST");
};
