var entityStream  = require('seneca-entity-save-stream')
  , actStream     = require('seneca-act-stream')
  , csvStream     = require('binary-csv')
  , through       = require('through2')
  , xtend         = require('xtend')
  , Joi           = require('joi')

function csvToObj(dest, opts) {
  var csv     = csvStream({
          highWaterMark: 16
        , json: true
      })
    , count   = 0

  opts = xtend({ skip: 0 }, opts)

  csv.pipe(through.obj({ highWaterMark: 16 }, function (obj, enc, callback) {
    if (count++ < opts.skip) {
      return callback()
    }

    var that  = this

    if (!opts.schema) {
      this.push(obj)
      callback()
    } else {
      Joi.validate(obj, opts.schema, {
          convert: true
        , stripUnknown: true
      }, function(err, obj) {
        if (!err) {
          that.push(obj)
        }
        callback()
      })
    }
  })).pipe(dest)

  dest.on('finish', function() {
    csv.emit('importCompleted')
  })

  dest.on('one', function() {
    csv.rowsImported++
    csv.emit('rowImported')
  })

  dest.on('oneError', function(err) {
    csv.emit('rowError', err)
  })

  csv.rowsImported = 0

  return csv
}

module.exports.entity = function importEntity(seneca, entity, opts) {
  var dest = entityStream(seneca, { name$: entity })
  return csvToObj(dest, opts)
}

module.exports.act = function importAct(seneca, pattern, opts) {
  var dest = actStream(seneca, pattern)
  return csvToObj(dest, opts)
}
