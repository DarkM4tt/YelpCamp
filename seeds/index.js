const mongoose = require('mongoose')
const Campground = require('../models/campgrounds')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

mongoose
  .connect(
    'mongodb+srv://YCamps:yelpcamp@cluster0.nid1u.mongodb.net/?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('MONNGO CONNECTION OPEN!!!')
  })
  .catch((err) => {
    console.log('OH NO MONGO ERROR!!!!')
    console.log(err)
  })

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      author: '6262aab121ce66ee03d150f8',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: 'https://source.unsplash.com/collection/483251',
      description:
        'kgvodkgopkgopekopkvrviokdl;vkopekrl,eopvkoper,voerk0-kvglkvvrp',
      price,
    })
    await camp.save()
  }
}

seedDB().then(() => {
  mongoose.connection.close()
})
