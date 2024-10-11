/**
 * @module models/HistoricalpriceChange
 * @description Mongoose schema for historical price change data
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;
const Decimal128 = require("bson").Decimal128;

/**
 * @constant
 * @description Schema for historical price change data
 */
const HPC = new Schema({
  /**
   * @property {ObjectId} productId - product id
   * @description unique id for the product
   */
  productId: {
    type: Schema.Types.ObjectId,
    required: false,
  },
  /**
   * @property {String} date - date of the price change
   * @description date in ISO format
   */
  date: {
    type: String,
    required: true,
  },
  /**
   * @property {Decimal128} Newprice - new price of the product
   * @description new price of the product
   */
  Newprice: {
    type: Decimal128,
    required: true,
  },
  /**
   * @property {Decimal128} diffrence - difference between the old and new price
   * @description difference between the old and new price
   */
  diffrence: {
    type: Decimal128,
    required: true,
  },
  /**
   * @property {Decimal128} oldPrice - old price of the product
   * @description old price of the product
   */
  oldPrice: {
    type: Decimal128,
    required: true,
  },
  overallPriceChange:{
    type: Decimal128,
    required: true,
    default:0
  },
},{timestamps:true});

/**
 * @constant
 * @description Mongoose model for historical price change data
 */
const HistoricalpriceChange = mongoose.model("priceChange", HPC);

module.exports = HistoricalpriceChange;