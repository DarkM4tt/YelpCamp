const { escapeRegExpChars } = require('ejs/lib/utils')
const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const Campground = require('./models/campgrounds')
const campgrounds = require('./models/campgrounds')
const methodOverride = require('method-override')

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

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
  res.send('Hello From YelpCamp')
})

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
})

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

app.get('/campgrounds/:id', async (req, res) => {
  const campground = await campgrounds.findById(req.params.id)
  res.render('campgrounds/show', { campground })
})

app.post('/campgrounds', async (req, res) => {
  const campground = new Campground(req.body.campground)
  await campground.save()
  res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await campgrounds.findById(req.params.id)
  res.render('campgrounds/edit', { campground })
})

app.put('/campgrounds/:id', async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  })
  res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndDelete(id, {
    ...req.body.campground,
  })
  res.redirect(`/campgrounds`)
})

app.listen('5000', () => {
  console.log('Listening On Port 5000')
})
