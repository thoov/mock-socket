var del = require('del');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var streamify = require('gulp-streamify');
var source = require('vinyl-source-stream');

gulp.task('clean', function(cb) {
  del(['dist'], cb);
});

gulp.task('build', ['clean'], function() {
  var bundleStream = browserify('./src/main.js').bundle();

  bundleStream
  .pipe(source('mock-socket.js'))
  .pipe(gulp.dest('./dist/'));

  bundleStream
  .pipe(source('mock-socket.min.js'))
  .pipe(streamify(uglify()))
  .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['build']);
