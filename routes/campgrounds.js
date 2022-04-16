const express = require('express')
const router = express.Router()
const { campgroundSchema } = require('../schemas.js')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campgrounds')
const campgrounds = require('../models/campgrounds')

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

router.get('/', async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
})

router.get('/new', (req, res) => {
  res.render('campgrounds/new')
})

router.post(
  '/',
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash('success', 'Successfuly made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const campground = await campgrounds
      .findById(req.params.id)
      .populate('reviews')
    if(!campground) {
      req.flash('error', 'Cannot find that Campground!' )
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
  })
)

router.get('/:id/edit', async (req, res) => {
  const campground = await campgrounds.findById(req.params.id)
  if(!campground) {
    req.flash('error', 'Cannot find that Campground!' )
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', { campground })
})

router.put(
  '/:id',
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    })
    req.flash('success', 'Successfuly updated campgroud!')
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

router.delete(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id, {
      ...req.body.campground,
    })
    req.flash('success', 'Successfully deleted a Campground')
    res.redirect(`/campgrounds`)
  })
)

module.exports = router
