const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// exports.checkID = (req, res, next, value) => {
//   if (value * 1 > tours.length) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

// 2. Route handlers
exports.getAllTours = catchAsync(async (req, res, next) => {
  // Execute the query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // Send response
  res.status(200).json({
    requestedAt: req.requestTime,
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // id comes from /:id (tourRoutes)
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({ _id: req.params.id })

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Returns new object updated
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: null, // null -> is taking all the data, is not grouping for specific field
        // _id: '$difficulty',
        // _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 }, // suma 1 cada registro hasta tener el total
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // Ordena de menor a mayor
    },
    // {
    //   $match: {
    //     _id: {
    //       $ne: 'EASY', // not equal to easy
    //     },
    //   },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    // $unwind: Descompone el array 'startDates' en documentos individuales
    // Si un tour tiene 3 fechas, creará 3 documentos separados (uno por fecha)
    // Ejemplo: { name: 'Tour A', startDates: [fecha1, fecha2] }
    //       -> { name: 'Tour A', startDates: fecha1 }
    //       -> { name: 'Tour A', startDates: fecha2 }
    {
      $unwind: '$startDates',
    },
    // $match: Filtra las fechas que estén dentro del año especificado
    // Solo mantiene tours cuya fecha de inicio esté entre enero 1 y diciembre 31 del año dado
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), // Mayor o igual a enero 1
          $lte: new Date(`${year}-12-31`), // Menor o igual a diciembre 31
        },
      },
    },
    // $group: Agrupa los tours por mes y calcula estadísticas
    {
      $group: {
        _id: { $month: '$startDates' }, // Agrupa por mes (1-12)
        numTourStarts: { $sum: 1 }, // Cuenta cuántos tours inician en ese mes
        tours: { $push: '$name' }, // Crea un array con los nombres de los tours
      },
    },
    // $addFields: Añade un nuevo campo 'month' con el valor del _id
    // Esto hace más legible el resultado (en lugar de usar _id para el mes)
    {
      $addFields: { month: '$_id' },
    },
    // $project: Oculta el campo _id de la respuesta
    // _id: 0 significa que NO se mostrará en el resultado final
    {
      $project: { _id: 0 },
    },
    // $sort: Ordena los resultados por número de tours de forma descendente
    // -1 = descendente (el mes con más tours aparecerá primero)
    {
      $sort: { numTourStarts: -1 },
    },
    // $limit: Limita el resultado a los primeros 12 documentos
    // Como hay 12 meses máximo, esto asegura que no haya más resultados
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});
