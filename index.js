var entityStream  = require('seneca-entity-save-stream')
  , actStream     = require('seneca-act-stream')
  , csvStream     = require('csv2')
  , headStream    = require('head-stream')
  , through       = require('through2')

function csvToObj(dest) {
  var csv   = csvStream()
    , head  = headStream(firstRow)

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

module.exports.entity = function importEntity(seneca, entity) {
  var dest = entityStream(seneca, { name$: entity })
  return csvToObj(dest)
}

module.exports.act = function importAct(seneca, pattern) {
  var dest = actStream(seneca, pattern)
  return csvToObj(dest)
}
