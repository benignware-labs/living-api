#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const { build, watch, start } = require('../lib/webpack');
const packageJson = require(path.resolve(__dirname, '../package.json'));

program
  .version(packageJson.version)
  .description(packageJson.description)
  .usage('[options] <context>')
  .option('-o, --output <s>', 'Specify destination directory', './docs')
  .option('-e, --entry <s>', 'Specify entry files', '**/*.md')
  .option('-w, --watch', 'Watch for changes')
  .option('-s, --start', 'Start dev server')
  .action((context) => {
    const config = {
      context,
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
  })

  .parse(process.argv);
