const mongoose = require('mongoose');

// Define properties for new schema (collection)
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true, // Remove white spaces in the beginning or end
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // This hides createdAt in the response
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true }, // Incluye virtuales cuando envías datos al cliente (API responses)
    toObject: { virtuals: true }, // Incluye virtuales cuando trabajas con el objeto en código
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Models start with capital letters
// Create new collection
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
