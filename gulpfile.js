var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    util = require('gulp-util'),
    htmllint = require('gulp-htmllint'),
    inquirer = require('inquirer'),
    semver = require('semver'),
    fs = require('fs'),
    {exec} = require('child_process'),
    package = require('./package.json');

var srcDir = './src/';
var srcFiles = srcDir + '**.js';

function run(bin, args, done) {
  var exe = '"' + process.execPath + '"';
  var src = require.resolve(bin);
  var ps = exec([exe, src].concat(args || []).join(' '));

  ps.stdout.pipe(process.stdout);
  ps.stderr.pipe(process.stderr);
  ps.on('close', () => done());
}

gulp.task('build', buildTask);
gulp.task('bump', bumpTask);
gulp.task('lint-html', lintHtmlTask);
gulp.task('lint-js', lintJsTask);
gulp.task('lint', gulp.parallel('lint-html', 'lint-js'));
gulp.task('watch', watchTask);
gulp.task('default', gulp.parallel('lint', 'build', 'watch'));

function buildTask(done) {
  run('rollup/bin/rollup', ['-c'], done);
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

function watchTask() {
  return gulp.watch(srcFiles, gulp.parallel('lint', 'build'));
}
