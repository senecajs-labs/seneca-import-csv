var entityStream  = require('seneca-entity-save-stream')
  , actStream     = require('seneca-act-stream')
  , csvStream     = require('csv2')
  , headStream    = require('head-stream')
  , through       = require('through2')
  , xtend         = require('xtend')
  , Joi           = require('joi')

function csvToObj(dest, opts) {
  var csv   = csvStream()
    , head  = headStream(firstRow)

  opts = xtend({ skip: 0 }, opts)

  function firstRow(header, done) {
    var count = 0

    function rowToObject(row) {
      var obj = {}

      for (var i = 0; i < header.length; i++) {
        obj[header[i]] = row[i]
      }

      return obj
    }

    head
      .pipe(through.obj({ highWaterMark: 16 }, function (chunk, enc, callback) {
        if (count++ < opts.skip) {
          return callback()
        }

        var obj   = rowToObject(chunk)
          , that  = this

        if (!opts.schema) {
          this.push(obj)
          callback()
        } else {
          Joi.validate(obj, opts.schema, { convert: true }, function(err, obj) {
            if (!err) {
              that.push(obj)
            }
            callback()
          })
        }
      }))
      .pipe(dest)

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

    done()
  }

  csv.pipe(head)

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
