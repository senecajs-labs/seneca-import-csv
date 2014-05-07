var entityStream  = require('seneca-entity-save-stream')
  , csvStream     = require('csv2')
  , headStream    = require('head-stream')
  , through       = require('through2')

function importCSV(seneca, entityName$) {

  var csv   = csvStream()
    , head  = headStream(firstRow)

  function firstRow(header, done) {

    var entity = entityStream(seneca, { name$: entityName$ })

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
      .pipe(entity)

    entity.on('finish', function() {
      csv.emit('importCompleted')
    })

    done()
  }

  csv.pipe(head)

  return csv
}

module.exports = importCSV
