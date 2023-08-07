import Product from "../models/product.js";
import Category from "../models/category.js";
import slugify from "slugify";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.js";
// import { v2 as cloudinary } from "cloudinary";

const createProduct = async (req, res) => {
  try {
    const { error } = createProductSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errors = error.details.reduce((acc, errItem) => {
        acc[errItem.path[0]] = errItem.message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        message: errors,
      });
    }

    const productName = req.body.name;
    const existingProduct = await Product.findOne({
      name: { $regex: productName, $options: "i" },
    });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: {
          name: "Products with the same name already exist, please re-enter the product name",
        },
      });
    }

    const thumbFiles = req.files["thumb"];
    const imageFiles = req.files["images"];

    const thumbFile = thumbFiles[0];
    const allowedThumbFileExtensions = ["jpg", "jpeg", "png", "webp"];
    const allowedThumbFileSize = 5 * 1024 * 1024; // 5 MB in bytes

    // Validate thumb file
    if (
      !allowedThumbFileExtensions.includes(
        thumbFile.originalname.split(".").pop().toLowerCase()
      ) ||
      thumbFile.size > allowedThumbFileSize
    ) {
      return res.status(400).json({
        success: false,
        message: {
          thumb:
            "Invalid thumbnail file. Only JPG, JPEG, PNG, or WEBP files are allowed, and the size must be less than 5 MB",
        },
      });
    }

    // Validate image files
    const allowedImageFileExtensions = ["jpg", "jpeg", "png", "webp"];
    const allowedImageFileSize = 5 * 1024 * 1024;

    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: {
          images: "Please upload at least one image file",
        },
      });
    }

    for (const imageFile of imageFiles) {
      if (
        !allowedImageFileExtensions.includes(
          imageFile.originalname.split(".").pop().toLowerCase()
        ) ||
        imageFile.size > allowedImageFileSize
      ) {
        return res.status(400).json({
          success: false,
          message: {
            images:
              "Invalid image file(s). Only JPG, JPEG, PNG, or WEBP files are allowed, and the size must be less than 5 MB",
          },
        });
      }
    }

    const newProduct = await Product.create(req.body);
    newProduct.thumb = thumbFile.path;
    newProduct.images = imageFiles.map((file) => file.path);
    await newProduct.save();

    return res.status(200).json({
      success: newProduct ? true : false,
      createdProduct: newProduct ? newProduct : "Thêm mới sản phẩm thất bại",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { error } = updateProductSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errors = error.details.reduce((acc, errItem) => {
        acc[errItem.path[0]] = errItem.message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        message: errors,
      });
    }

    const { id } = req.params;
    const { categoryId: newCategoryId } = req.body;

    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    const oldCategoryId = product.categoryId;

    if (oldCategoryId && oldCategoryId.toString() !== newCategoryId) {
      const oldCategory = await Category.findById(oldCategoryId);
      if (oldCategory) {
        oldCategory.products = oldCategory.products.filter(
          (productId) => productId.toString() !== id
        );

        await oldCategory.save();
      } else {
        return res.status(400).json({
          success: false,
          message: `Không tìm thấy danh mục cũ: ${oldCategoryId}`,
        });
      }
    }

    const productName = req.body.name;
    let newSlug = product.slug;
    if (productName) {
      const existingProduct = await Product.findOne({
        _id: { $ne: id },
        name: { $regex: productName, $options: "i" },
      });

      newSlug = slugify(req.body.name, { lower: true });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: {
            name: "Products with the same name already exist, please re-enter the product name",
          },
        });
      }
    }

    const thumbFiles = req?.files?.["thumb"];
    const imageFiles = req?.files?.["images"];

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...req.body, slug: newSlug },
      {
        new: true,
      }
    );

    const allowedThumbFileExtensions = ["jpg", "jpeg", "png", "webp"];
    const allowedThumbFileSize = 5 * 1024 * 1024; // 5 MB in bytes

    // Validate thumb file
    if (thumbFiles && thumbFiles.length > 0) {
      const thumbFile = thumbFiles[0];
      if (
        !allowedThumbFileExtensions.includes(
          thumbFile.originalname.split(".").pop().toLowerCase()
        ) ||
        thumbFile.size > allowedThumbFileSize
      ) {
        return res.status(400).json({
          success: false,
          message: {
            thumb:
              "Invalid thumbnail file. Only JPG, JPEG, PNG, or WEBP files are allowed, and the size must be less than 5 MB",
          },
        });
      } else {
        updatedProduct.thumb = thumbFiles[0].path;
      }
    }

    // Validate image files
    const allowedImageFileExtensions = ["jpg", "jpeg", "png", "webp"];
    const allowedImageFileSize = 5 * 1024 * 1024;

    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        if (
          !allowedImageFileExtensions.includes(
            imageFile.originalname.split(".").pop().toLowerCase()
          ) ||
          imageFile.size > allowedImageFileSize
        ) {
          return res.status(400).json({
            success: false,
            message: {
              images:
                "Invalid image file(s). Only JPG, JPEG, PNG, or WEBP files are allowed, and the size must be less than 5 MB",
            },
          });
        } else {
          updatedProduct.images = imageFiles.map((file) => file.path);
        }
      }
    }

    await updatedProduct.save();

    return res.status(200).json({
      success: updatedProduct ? true : false,
      updatedProduct: updatedProduct
        ? updatedProduct
        : "Cập nhật sản phẩm thất bại",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteProduct = await Product.findById(id);

    if (!deleteProduct) throw new Error("Không tìm thấy sản phẩm");

    await Category.findByIdAndUpdate(deleteProduct.categoryId, {
      $pull: { products: id },
    });

    const deletedProduct = await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: deletedProduct ? true : false,
      deletedProduct: deletedProduct ? deletedProduct : "Cannot delete product",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      mes: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("categoryId", "name");

    if (product) {
      return res.status(200).json({
        success: true,
        productData: product,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm!",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const productSlug = req.params.slug;
    const product = await Product.findOne({ slug: productSlug }).populate({
      path: "categoryId",
      select: "name slug",
    });

    if (product) {
      return res.status(200).json({
        success: true,
        productData: product,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm!",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const queries = { ...req.query };
    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((item) => delete queries[item]);

    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (matchedItem) => `$${matchedItem}`
    );

    const formattedQueries = JSON.parse(queryString);

    if (queries?.name)
      formattedQueries.name = { $regex: queries.name, $options: "i" };

    if (queries?.category) {
      const category = await Category.findOne({
        slug: queries.category.toLowerCase(),
      });
      if (category) {
        formattedQueries.categoryId = category._id;
      } else {
        return res.status(200).json({
          success: false,
          totalPages: 0,
          totalProduct: 0,
          products: [],
        });
      }
    }

    let queryCommand = Product.find(formattedQueries).populate({
      path: "categoryId",
      select: "name slug",
    });

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      queryCommand = queryCommand.sort(sortBy);
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      queryCommand = queryCommand.select(fields);
    } else {
      queryCommand = queryCommand.select("-__v");
    }

    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const skip = (page - 1) * limit;

    queryCommand = queryCommand.skip(skip).limit(limit);

    const response = await queryCommand.exec();
    const totalProduct = await Product.countDocuments(formattedQueries);
    const totalPages = Math.ceil(totalProduct / +limit);

    return res.status(200).json({
      success: response ? true : false,
      totalPages,
      totalProduct,
      products: response ? response : "Cannot get products",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      mes: error?.message,
    });
  }
};

const uploadImagesProducts = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files) throw new Error("Missing inputs");

    const response = await Product.findByIdAndUpdate(
      id,
      {
        $push: { images: { $each: req.files.map((el) => el.path) } },
      },
      { new: true }
    );

    return res.status(200).json({
      status: response ? true : false,
      updatedProduct: response ? response : "Cannot upload images product",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      mes: error?.message,
    });
  }
};

export {
  createProduct,
  updateProduct,
  getProducts,
  deleteProduct,
  getProductById,
  getProductBySlug,
};
