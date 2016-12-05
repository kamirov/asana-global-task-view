// Build tools
import gulp from "gulp";
import browserify from "browserify";
import babelify from "babelify";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

// Gulp plugins
import sourcemaps from "gulp-sourcemaps";
import gutil from "gulp-util";
import gulpif from "gulp-if";
import babel from "gulp-babel";
import eslint from "gulp-eslint";
import changed from "gulp-changed";
import imagemin from "gulp-imagemin";
import minifyHTML from "gulp-minify-html";
import concat from "gulp-concat";
import stripDebug from "gulp-strip-debug";
import uglify from "gulp-uglify";
import autoprefix from "gulp-autoprefixer";
import minifyCSS from "gulp-minify-css";
import sass from "gulp-sass";

const config = {
   srcPath: "./extension/src",
   dstPath: "./extension/dist",
}


// Script linting (sync)
gulp.task("lint", () => {
   gulp.src(config.srcPath + "/scripts/*.js")
      .pipe(eslint())
      .pipe(eslint.format())
      .on('error', (err) => {});
      // .pipe(eslint.failAfterError())
});


// General scripts
gulp.task("scripts", ['lint'], () => {

   const files = ["main", "options"];

   let tasks = files.map((file) =>
      browserify({
         entries: [config.srcPath + "/scripts/" + file + ".js"],
         debug: true
     }).transform(babelify)
     .bundle()
     .on('error', (err) => {})
     .pipe(source(file + "-bundle.js"))
     .pipe(buffer())
     .pipe(sourcemaps.init({ loadMaps: true }))
//     .pipe(stripDebug())
     .pipe(uglify())
     .pipe(sourcemaps.write('.'))
     .pipe(gulp.dest(config.dstPath + "/scripts"))
   );
});
  


// General images
gulp.task('images', () =>
   gulp.src(config.srcPath + "/images/*")
      .pipe(changed(config.dstPath + "/images"))
      .pipe(imagemin())
      .pipe(gulp.dest(config.dstPath + "/images"))
);


// HTML tasks
gulp.task("html", () =>
   gulp.src(config.srcPath + '/*.html')
      .pipe(changed(config.dstPath))
      .pipe(minifyHTML())
      .pipe(gulp.dest(config.dstPath))
);


// Styles tasks
gulp.task("styles", () =>
   gulp.src(config.srcPath + "/styles/*.scss")
      .pipe(concat('bundle.scss'))
      .pipe(sourcemaps.init())
      .pipe(sass())
      .pipe(autoprefix('last 2 versions'))
      .pipe(minifyCSS())
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(config.dstPath + "/styles"))
);


// All tasks
gulp.task("default", ["scripts", "styles", "images", "html"]);

// Watcher
gulp.task("watch", ["default"], () => {
   gulp.watch(config.srcPath + "/*.html", ["html"]);
   gulp.watch(config.srcPath + "/images/*", ["images"]);
   gulp.watch(config.srcPath + "/scripts/*.js", ["scripts"]);
   gulp.watch(config.srcPath + "/styles/*.scss", ["styles"]);
});