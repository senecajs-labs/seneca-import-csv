var entityStream  = require('seneca-entity-save-stream')
  , actStream     = require('seneca-act-stream')
  , csvStream     = require('csv2')
  , headStream    = require('head-stream')
  , through       = require('through2')

function importCSV(seneca, opts) {

  var csv   = csvStream()
    , head  = headStream(firstRow)
    , dest  = buildDestStream(seneca, opts)

  function firstRow(header, done) {

    function rowToObject(row) {
      var obj = {}

      for (var i = 0; i < header.length; i++) {
        obj[header[i]] = row[i]
      }

      return obj
    }

    head
      .pipe(through.obj({ highWaterMark: 16 }, function (chunk, enc, callback) {
        this.push(rowToObject(chunk))
        callback()
      }))
      .pipe(dest)

    dest.on('finish', function() {
      csv.emit('importCompleted')
    })

    done()
  }

  csv.pipe(head)

  return csv
}

function buildDestStream(seneca, opts) {
  if (opts.entity) {
    return entityStream(seneca, { name$: opts.entity })
  } else if (opts.act) {
    return actStream(seneca, opts.act)
  } else {
    throw new Error('unknown opts')
  }
}

module.exports = importCSV
