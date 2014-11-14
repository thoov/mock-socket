var del = require('del');
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('dist', ['vendor', 'lib', 'clean'], function() {
    return gulp.src(['./build/vendor.min.js', './build/lib.min.js'])
      .pipe(concat('mock-socks.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./dist/'));
});

gulp.task('lib', ['clean'], function() {
    return gulp.src('./lib/*.js')
      .pipe(concat('lib.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./build/'));
});

gulp.task('vendor', ['clean'], function() {
    return gulp.src('./vendor/*.js')
      .pipe(concat('vendor.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./build/'));
});

gulp.task('clean', function(cb) {
    del(['build', 'dist'], cb);
});

gulp.task('default', ['dist']);
