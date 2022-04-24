const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campgrounds')
const campgrounds = require('../models/campgrounds')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')

router.get('/', async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
})

router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new')
})

router.post(
  '/',
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    campground.author = req.user._id
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
      .populate({
        path: 'reviews',
        populate: {
          path: 'author',
        },
      })
      .populate({
        path: 'author',
        strictPopulate: false,
      })
    if (!campground) {
      req.flash('error', 'Cannot find that Campground!')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
  })
)

router.get('/:id/edit', isLoggedIn, isAuthor, async (req, res) => {
  const { id } = req.params
  const campground = await campgrounds.findById(id)
  if (!campground) {
    req.flash('error', 'Cannot find that Campground!')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', { campground })
})

router.put(
  '/:id',
  isLoggedIn,
  isAuthor,
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
  isLoggedIn,
  isAuthor,
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
