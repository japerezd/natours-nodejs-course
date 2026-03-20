const slugify = require('slugify');
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
    slug: String,
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
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, // Incluye virtuales cuando envías datos al cliente (API responses)
    toObject: { virtuals: true }, // Incluye virtuales cuando trabajas con el objeto en código
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true });
});

// tourSchema.pre('save', function () {
//   console.log('Will save the document');
// });

// tourSchema.post('save', function (doc) {
//   console.log(doc);
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function () {
// this works for find and findOne (and any other query that starts with find)
tourSchema.pre(/^find/, function () {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
});

tourSchema.post(/^find/, function (docs) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function () {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
});

// Models start with capital letters
// Create new collection
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
