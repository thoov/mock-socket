var del = require('del');
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var streamify = require('gulp-streamify');
var source = require('vinyl-source-stream');

gulp.task('clean', function(cb) {
  del(['dist'], cb);
});

gulp.task('build', ['clean'], function() {
  var bundleStream = browserify('./src/main.js').bundle()

  bundleStream
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('./dist/'));

  bundleStream
  .pipe(source('bundle.min.js'))
  .pipe(streamify(uglify()))
  .pipe(gulp.dest('./dist/'));
});
