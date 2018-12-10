#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const { build, watch, start } = require('../lib/webpack');

program
  .version('0.1.0')
  .option('-o, --output <s>', 'Specify destination directory', './docs')
  .option('-e, --entry <s>', 'Specify entry files', '**/*.md')
  .option('-w, --watch', 'Watch for changes')
  .option('-s, --start', 'Start dev server')
  .parse(process.argv);

const config = {
  output: path.resolve(program.output),
  entry: program.entry
};

if (program.start) {
  start(config);
} else if (program.watch) {
  watch(config);
} else {
  build(config);
}
