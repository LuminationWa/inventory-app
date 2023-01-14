const Category = require("../models/category");
const Item = require("../models/item");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Categories.
exports.category_list = (req, res, next) => {
  Category.find({}, "name")
    .sort({ name: 1 })
    .exec(function (err, list_category) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("category_list", { title: "Category List", category_list: list_category });
    });
};

// Display detail page for a specific Category.
exports.category_detail = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },

      category_items(callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("category_detail", {
        title: "Category Detail",
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

// Display Category create form on GET.
exports.category_create_get = (req, res) => {
  res.render("category_form", { title: "Create Category" });};

// Handle Category create on POST.
exports.category_create_post = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Name must be specified."),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Description name must be specified."),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("category_form", {
        title: "Create Category",
        author: req.body,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    // Create a Category object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });
    category.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new Category record.
      res.redirect(category.url);
    });
  },
];

// Display Category delete form on GET.
exports.category_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Category delete GET");
};

// Handle Category delete on POST.
exports.category_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Category delete POST");
};

// Display Category update form on GET.
exports.category_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Category update GET");
};

// Handle Category update on POST.
exports.category_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Category update POST");
};