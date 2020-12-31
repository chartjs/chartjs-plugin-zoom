var gulp = require('gulp');
var eslint = require('gulp-eslint');
var file = require('gulp-file');
var util = require('gulp-util');
var htmllint = require('gulp-htmllint');
var replace = require('gulp-replace');
var streamify = require('gulp-streamify');
var zip = require('gulp-zip');
var inquirer = require('inquirer');
var semver = require('semver');
var path = require('path');
var fs = require('fs');
var karma = require('karma');
var merge = require('merge-stream');
var yargs = require('yargs');
var pkg = require('./package.json');

var argv = yargs
  .option('verbose', {default: false})
  .argv;

var srcDir = './src/';
var srcFiles = srcDir + '**.js';
var outDir = './dist/';

gulp.task('package', packageTask);
gulp.task('bump', bumpTask);
gulp.task('lint-html', lintHtmlTask);
gulp.task('lint-js', lintJsTask);
gulp.task('lint', gulp.parallel('lint-html', 'lint-js'));
gulp.task('unittest', unittestTask);
gulp.task('test', gulp.parallel('lint', 'unittest'));
gulp.task('watch', watchTask);
gulp.task('default', gulp.parallel('lint', 'watch'));

function packageTask() {
  return merge(
    // gather "regular" files landing in the package root
    gulp.src([outDir + '*.js', 'LICENSE.md']),

    // since we moved the dist files one folder up (package root), we need to rewrite
    // samples src="../dist/ to src="../ and then copy them in the /samples directory.
    gulp.src('./samples/**/*', {base: '.'})
      .pipe(streamify(replace(/src="((?:\.\.\/)+)dist\//g, 'src="$1')))
  )
  // finally, create the zip archive
  .pipe(zip(pkg.name + '.zip'))
  .pipe(gulp.dest(outDir));
}

/*
 *  Usage : gulp bump
 *  Prompts: Version increment to bump
 *  Output: - New version number written into package.json
 */
function bumpTask(complete) {
  util.log('Current version:', util.colors.cyan(pkg.version));
  var choices = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'].map(function(versionType) {
    return versionType + ' (v' + semver.inc(pkg.version, versionType) + ')';
  });
  inquirer.prompt({
    type: 'list',
    name: 'version',
    message: 'What version update would you like?',
    choices: choices
  }).then(function(res) {
    var increment = res.version.split(' ')[0],
      newVersion = semver.inc(pkg.version, increment);

    // Set the new versions into the package object
    pkg.version = newVersion;

    // Write these to their own files, then build the output
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

    complete();
  });
}

function lintJsTask() {
  var files = [
    'samples/**/*.html',
    'samples/**/*.js',
    'src/**/*.js',
    'test/**/*.js'
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

function lintHtmlTask() {
  return gulp.src('samples/**/*.html')
    .pipe(htmllint({
      failOnError: true,
    }));
}

function unittestTask(done) {
  new karma.Server({
    configFile: path.join(__dirname, 'karma.conf.js'),
    singleRun: !argv.watch,
    args: {
      coverage: !!argv.coverage,
      inputs: (argv.inputs || 'test/specs/**/*.js').split(';'),
      watch: argv.watch
    }
  },
  // https://github.com/karma-runner/gulp-karma/issues/18
  function(error) {
    error = error ? new Error('Karma returned with the error code: ' + error) : undefined;
    done(error);
  }).start();
}

function watchTask() {
  return gulp.watch(srcFiles, gulp.parallel('lint'));
}
