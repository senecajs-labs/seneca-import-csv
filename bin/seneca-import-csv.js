#! /usr/bin/env node

var importer    = require('../')
  , ProgressBar = require('progress')
  , fs          = require('fs')
  , path        = require('path')
  , csv         = require('csv2')
  , Joi         = require('joi')

  , argv = require('yargs')
    .usage('Usage: $0 -e entity -f file -c config')
    .demand(['e','f', 'c'])
    .alias('e', 'entity')
    .alias('f', 'file')
    .alias('c', 'config')
    .alias('r', 'resume')
    .describe('e', 'the entity to import to')
    .describe('f', 'the file to import from')
    .describe('c', 'the config of the seneca data store')
    .describe('r', 'the file to store the current state, to resume')
    .argv

function doImport(total) {

  var seneca = require('seneca')({
        log:{
          map:[
            {level:'warn',handler:'print'}
          ]
        }
      })

    , bar = new ProgressBar('importing [:bar] :percent :etas', {
          width: 20
        , incomplete: ' '
        , total: total
      })

    , skip = 0

    , config = require(path.resolve(argv.config))

    , schema = config.schema

  if (typeof config === 'object') {
    seneca.use(config.store, config.opts)
  } else if (typeof config === 'function') {
    schema = config(seneca, Joi)
  }

  seneca.ready(function() {
    fs.createReadStream(argv.file)
      .pipe(dest)
  })

  try {
    skip = parseInt(fs.readFileSync(argv.resume))
    console.log('skipping', skip, 'rows')
    bar.tick(skip)
  } catch(err) {
    // not neeed after all
  }

  if (skip === NaN) {
    skip = 0
  }

  dest = importer.entity(seneca, argv.entity, {
      skip: skip
    , schema: schema
  })

  if (argv.resume) {
    setInterval(function() {
      var count = dest.rowsImported + skip
      fs.writeFile(argv.resume, '' + count, function(err) {
        if (err) {
          console.log(err)
        }
        // nothing to do!
      })
    }, 100)
  }

  dest.on('rowImported', function() {
    bar.tick()
  })

  dest.on('importCompleted', function() {
    console.log()
    console.log('Imported', dest.rowsImported, 'rows')
  })
}

function computeTotal() {

  var stat = fs.statSync(argv.file)

    , bar = new ProgressBar('checking  [:bar] :percent :etas', {
          width: 20
        , incomplete: ' '
        , total: stat.size
      })

    , total = 0

    , fileStream = fs.createReadStream(argv.file)

    , csvStream  = fileStream.pipe(csv())

  fileStream.on('data', function(chunk) {
    bar.tick(chunk.length)
  })

  csvStream.on('end', function() {
    doImport(total)
  })

  csvStream.on('data', function(row) {
    total++
  })
}

computeTotal()
