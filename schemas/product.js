import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Product name cannot be empty",
    "any.required": "Product name field is required",
  }),
  thumb: Joi.string().trim().messages({
    "string.empty": "The product thumbnail cannot be blank",
  }),
  images: Joi.array().items(Joi.string()).messages({
    "array.base": "Product detail images cannot be left blank",
    "string.empty": "Product detail images cannot be left blank",
  }),
  price: Joi.number().required().messages({
    "number.empty": "Product price cannot be empty",
    "any.required": "Product price field is required",
  }),
  description: Joi.string().trim().messages({
    "string.empty": "Product description cannot be blank",
  }),
  categoryId: Joi.string().trim().required().messages({
    "string.empty": "Please select a product category",
    "any.required": "Product category field is required",
  }),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().messages({
    "string.empty": "Product name cannot be empty",
  }),
  thumb: Joi.string().trim().messages({
    "string.empty": "The product thumbnail cannot be blank",
  }),
  images: Joi.array().items(Joi.string()).messages({
    "array.base": "Product detail images cannot be left blank",
    "string.empty": "Product detail images cannot be left blank",
  }),
  price: Joi.number().messages({
    "number.empty": "Product price cannot be empty",
  }),
  description: Joi.string().trim().messages({
    "string.empty": "Product description cannot be blank",
  }),
  categoryId: Joi.string().trim().messages({
    "string.empty": "Please select a product category",
  }),
});
