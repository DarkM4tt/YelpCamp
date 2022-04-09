const { escapeRegExpChars } = require('ejs/lib/utils')
const mongoose = require('mongoose')
const express = require('express')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const path = require('path')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const Campground = require('./models/campgrounds')
const campgrounds = require('./models/campgrounds')
const methodOverride = require('method-override')
const Joi = require('joi')
const ejsMate = require('ejs-mate')
const res = require('express/lib/response')
const Review = require('./models/review')

mongoose
  .connect('mongodb://0.0.0.0:27017/yelp-camp')
  .then(() => {
    console.log('MONNGO CONNECTION OPEN!!!')
  })
  .catch((err) => {
    console.log('OH NO MONGO ERROR!!!!')
    console.log(err)
  })

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

app.get('/', (req, res) => {
  res.send(
    '<h1>Hello From YelpCamp!</h1> <a href="/campgrounds">All Campgrounds</a>'
  )
})

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
})

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

app.get(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const campground = await campgrounds
      .findById(req.params.id)
      .populate('reviews')
    res.render('campgrounds/show', { campground })
  })
)

app.post(
  '/campgrounds',
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await campgrounds.findById(req.params.id)
  res.render('campgrounds/edit', { campground })
})

app.put(
  '/campgrounds/:id',
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    })
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

app.delete(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id, {
      ...req.body.campground,
    })
    res.redirect(`/campgrounds`)
  })
)

app.post(
  '/campgrounds/:id/reviews',
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

app.delete(
  '/campgrounds/:id/reviews/:reviewId',
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
  })
)

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error', { err })
})

app.listen('5000', () => {
  console.log('Listening On Port 5000')
})
