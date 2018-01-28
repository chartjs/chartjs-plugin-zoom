var gulp = require('gulp'),
    concat = require('gulp-concat'),
    eslint = require('gulp-eslint'),
    uglify = require('gulp-uglify'),
    util = require('gulp-util'),
    replace = require('gulp-replace'),
    insert = require('gulp-insert'),
    inquirer = require('inquirer'),
    semver = require('semver'),
    exec = require('child_process').exec,
    fs = require('fs'),
    package = require('./package.json'),
    browserify = require('browserify'),
    streamify = require('gulp-streamify'),
    source = require('vinyl-source-stream'),
    merge = require('merge-stream');

var srcDir = './src/';
var srcFiles = srcDir + '**.js';
var outDir = './';

var header = "/*!\n\
 * chartjs-plugin-zoom\n\
 * http://chartjs.org/\n\
 * Version: {{ version }}\n\
 *\n\
 * Copyright 2016 Evert Timberg\n\
 * Released under the MIT license\n\
 * https://github.com/chartjs/chartjs-plugin-zoom/blob/master/LICENSE.md\n\
 */\n";

gulp.task('default', ['lint', 'build', 'watch']);
gulp.task('build', buildTask);
gulp.task('bump', bumpTask);
gulp.task('lint', lintTask);
gulp.task('watch', watchTask);

function buildTask() {
  var nonBundled = browserify('./src/chart.zoom.js')
    .ignore('chart.js')
    .ignore('hammerjs')
    .bundle()
    .pipe(source('chartjs-plugin-zoom.js'))
    .pipe(insert.prepend(header))
    .pipe(streamify(replace('{{ version }}', package.version)))
    .pipe(gulp.dest(outDir))
    .pipe(streamify(uglify({
      preserveComments: 'some'
    })))
    .pipe(streamify(concat('chartjs-plugin-zoom.min.js')))
    .pipe(gulp.dest(outDir));

  return nonBundled;

}

/*
 *  Usage : gulp bump
 *  Prompts: Version increment to bump
 *  Output: - New version number written into package.json
 */
function bumpTask(complete) {
  util.log('Current version:', util.colors.cyan(package.version));
  var choices = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'].map(function(versionType) {
    return versionType + ' (v' + semver.inc(package.version, versionType) + ')';
  });
  inquirer.prompt({
    type: 'list',
    name: 'version',
    message: 'What version update would you like?',
    choices: choices
  }).then(function(res) {
    var increment = res.version.split(' ')[0],
      newVersion = semver.inc(package.version, increment);

    // Set the new versions into the package object
    package.version = newVersion;

    // Write these to their own files, then build the output
    fs.writeFileSync('package.json', JSON.stringify(package, null, 2));

    complete();
  });
}

function lintTask() {
  var files = [
    'samples/**/*.js',
    'src/**/*.js'
  ];

  // NOTE(SB) codeclimate has 'complexity' and 'max-statements' eslint rules way too strict
  // compare to what the current codebase can support, and since it's not straightforward
  // to fix, let's turn them as warnings and rewrite code later progressively.
  var options = {
    rules: {
      'complexity': [1, 10],
      'max-statements': [1, 30]
    }
  };

  return gulp.src(files)
    .pipe(eslint(options))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function watchTask() {
  return gulp.watch(srcFiles, ['lint', 'build']);
}
