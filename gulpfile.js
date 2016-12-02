let gulp = require("gulp");

// Plugins
let babel = require("gulp-babel");
let jshint = require('gulp-jshint');
let changed = require('gulp-changed');
let imagemin = require('gulp-imagemin');
let minifyHTML = require('gulp-minify-html');
let concat = require('gulp-concat');
let stripDebug = require('gulp-strip-debug');
let uglify = require('gulp-uglify');
let autoprefix = require('gulp-autoprefixer');
let minifyCSS = require('gulp-minify-css');


// gulp.task("default", function () {
//   return gulp.src("src/app.js")
//     .pipe(babel())
//     .pipe(gulp.dest("dist"));
// });