const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');
const newer = require('gulp-newer');
const babel = require('gulp-babel');
const through = require('through2');
const chalk = require('chalk');

const base = path.join(__dirname, 'packages');
const scripts = './packages/*/src/**/*.js';

gulp.task('default', ['build']);

gulp.task('build', () => (
  gulp
    .src(scripts, { base })
    .pipe(plumber({
      errorHandler: (err) => {
        gutil.log(err.stack);
      }
    }))
    .pipe(newer({
      dest: base,
      map: swapSrcWithLib
    }))
    .pipe(through.obj((file, enc, callback) => {
      gutil.log('Compiling', `'${chalk.cyan(file.relative)}'...`);
      callback(null, file);
    }))
    .pipe(babel())
    .pipe(through.obj((file, enc, callback) => {
      file.path = path.resolve(file.base, swapSrcWithLib(file.relative));
      callback(null, file);
    }))
    .pipe(gulp.dest(base))
));

function swapSrcWithLib(srcPath) {
  const parts = srcPath.split(path.sep);
  parts[1] = "lib";

  return parts.join(path.sep);
}
