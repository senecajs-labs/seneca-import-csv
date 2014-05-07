#! /usr/bin/env node

var importer    = require('../')
  , ProgressBar = require('progress')
  , fs          = require('fs')
  , through     = require('through2')

  , argv = require('yargs')
    .usage('Usage: $0 -e entity -f file -c config')
    .demand(['e','f', 'c'])
    .alias('e', 'entity')
    .alias('f', 'file')
    .alias('c', 'config')
    .describe('e', 'the entity to import to')
    .describe('f', 'the file to import from')
    .describe('c', 'the config of the seneca data store')
    .argv

  , seneca = require('seneca')({
      log:{
        map:[
          {level:'warn',handler:'print'}
        ]
      }
    })

  , stat = fs.statSync(argv.file)

  , bar = new ProgressBar('importing [:bar] :percent :etas', {
        width: 20
      , incomplete: ' '
      , total: stat.size
    })

  , tracker = through(function(chunk, enc, done) {
      bar.tick(chunk.length)
      this.push(chunk, enc)
      done()
    })

fs.createReadStream(argv.file)
  .pipe(tracker)
  .pipe(importer.entity(seneca, argv.entity))

bar.tick()
