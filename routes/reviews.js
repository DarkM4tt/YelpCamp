const express = require('express')
const router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync')
const Review = require('../models/review')
const Campground = require('../models/campgrounds')
const ExpressError = require('../utils/ExpressError')
const { reviewSchema } = require('../schemas.js')
const campgrounds = require('../models/campgrounds')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const reviews = require('../controllers/review')
const review = require('../models/review')

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
)

module.exports = router
