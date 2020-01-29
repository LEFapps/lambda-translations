const mongoose = require('mongoose')

const { keys, difference, set, size } = require('lodash')

let connection = null

module.exports.translate = async (event, context) => {
  const { mongoURI, _id, md, category, params, args } = event
  if (!mongoURI) {
    throw new Error('Mongo URI not defined')
  }

  context.callBackWaitsForEmptyEventLoop = false

  if (connection == null) {
    connection = await mongoose.createConnection(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      bufferMaxEntries: 0
    })
    const schema = require('./schema')
    connection.model('Translation', schema)
  }

  const model = connection.model('Translation')

  if (!args.language) {
    return await model.findById(_id)
  }
  const fields = { params: 1 }
  fields[args.language] = 1
  const translation = await model.findById(_id).select(fields)
  if (!args.skipSettings) {
    if (!translation) {
      model.create({ _id, md, category, params: keys(params) })
      return { _id }
    } else {
      const modifier = {}
      if (md !== translation.md) {
        md ? set(modifier, '$set.md', md) : set(modifier, '$unset.md', '')
      }
      const newParams = difference(keys(params), translation.params)
      if (newParams.length) {
        newParams.forEach(param => set(modifier, '$addToSet.params', param))
      }
      // maybe update category here too (for rare cases?)
      if (size(modifier) && _id) {
        // console.log(
        //   `Translation ${_id} updated with ${JSON.stringify(modifier)}`
        // )
        model.update({ _id }, modifier)
      }
    }
  }
  model.update({ _id }, { $inc: { views: 1 } })

  return translation
}
