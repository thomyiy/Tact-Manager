const browsersync = require('browser-sync').create();
const cached = require('gulp-cached');
const del = require('del');
const fileinclude = require('gulp-file-include');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const npmdist = require('gulp-npm-dist');
const replace = require('gulp-replace');
const uglify = require('gulp-uglify');
const useref = require('gulp-useref-plus');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const cleanCSS = require('gulp-clean-css');
const rtlcss = require('gulp-rtlcss');

const isSourceMap = true;

const sourceMapWrite = (isSourceMap) ? "./" : false;

const paths = {
  base: {
    base: {
      dir: './'
    },
    node: {
      dir: './node_modules'
    },
    packageLock: {
      files: './package-lock.json'
    }
  },
  dist: {
    base: {
      dir: './public',
      files: './public/**/*'
    },
    libs: {
      dir: './public/assets/libs'
    },
    css: {
      dir: './public/assets/css',
    },
    js: {
      dir: './public/assets/js',
      files: './public/assets/js/pages',
    },
  },
  src: {
    base: {
      dir: './src',
      files: './src/**/*'
    },
    css: {
      dir: './src/assets/css',
      files: './src/assets/css/**/*'
    },
    img: {
      dir: './src/assets/images',
      files: './src/assets/images/**/*',
    },
    js: {
      dir: './src/assets/js',
      pages: './src/assets/js/pages',
      files: './src/assets/js/pages/*.js',
      main: './src/assets/js/*.js',
    },
    scss: {
      dir: './src/assets/scss',
      files: './src/assets/scss/**/*',
      main: './src/assets/scss/*.scss',
      icons: './src/assets/scss/icons.scss',
      iconsPlugin: './src/assets/scss/plugins/icons/*',
      bootstrap: './src/assets/scss/bootstrap.scss',
      vars: './src/assets/scss/_variable*.scss',
      utility: './src/assets/scss/components/_utilities.scss',
    }
  }
};

gulp.task('browsersync', function (callback) {
  browsersync.init({
    server: {
      baseDir: [paths.dist.base.dir, paths.src.base.dir]
    },
  });
  callback();
});

gulp.task('browsersyncReload', function (callback) {
  browsersync.reload();
  callback();
});

gulp.task('watch', function () {
  gulp.watch([paths.src.scss.dir,  "!" + paths.src.scss.bootstrap, "!" + paths.src.scss.icons, "!" + paths.src.scss.iconsPlugin], gulp.series('scss', 'browsersyncReload'));
  gulp.watch([paths.src.scss.bootstrap, paths.src.scss.vars, paths.src.scss.utility], gulp.series('bootstrap', 'browsersyncReload'));
  gulp.watch([paths.src.scss.icons, paths.src.scss.iconsPlugin], gulp.series('icons', 'browsersyncReload'));
  gulp.watch([paths.src.js.dir], gulp.series('js', 'browsersyncReload'));
  gulp.watch([paths.src.js.pages], gulp.series('jsPages', 'browsersyncReload'));
});

gulp.task('js', function () {
  return gulp
    .src(paths.src.js.main)
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist.js.dir));
});

gulp.task('jsPages', function () {
  return gulp
    .src(paths.src.js.files)
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist.js.files));
});

gulp.task('icons', function () {
  return gulp
    .src([paths.src.scss.icons])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.dist.css.dir))
    .pipe(cleanCSS())
    .pipe(rename({suffix: ".min"}))
    .pipe(sourcemaps.write(sourceMapWrite))
    .pipe(gulp.dest(paths.dist.css.dir));
});

gulp.task('bootstrap', function () {
  // generate ltr  
  gulp
    .src([paths.src.scss.bootstrap])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.dist.css.dir))
    .pipe(cleanCSS())
    .pipe(rename({suffix: ".min"}))
    .pipe(sourcemaps.write(sourceMapWrite))
    .pipe(gulp.dest(paths.dist.css.dir));

  // generate rtl
  return gulp
    .src([paths.src.scss.bootstrap])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoprefixer()
    )
    .pipe(rtlcss())
    .pipe(gulp.dest(paths.dist.css.dir))
    .pipe(cleanCSS())
    .pipe(rename({suffix: "-rtl.min"}))
    .pipe(sourcemaps.write(sourceMapWrite))
    .pipe(gulp.dest(paths.dist.css.dir));
});

gulp.task('scss', function () {
  // generate ltr  
  gulp
    .src([paths.src.scss.main, "!" + paths.src.scss.bootstrap, "!" + paths.src.scss.icons, "!" + paths.src.scss.iconsPlugin])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.dist.css.dir))
    .pipe(cleanCSS())
    .pipe(rename({suffix: ".min"}))
    .pipe(sourcemaps.write(sourceMapWrite))
    .pipe(gulp.dest(paths.dist.css.dir));

  // generate rtl
  return gulp
    .src([paths.src.scss.main, "!" + paths.src.scss.bootstrap, "!" + paths.src.scss.icons, "!" + paths.src.scss.iconsPlugin])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(rtlcss())
    .pipe(gulp.dest(paths.dist.css.dir))
    .pipe(cleanCSS())
    .pipe(rename({suffix: "-rtl.min"}))
    .pipe(sourcemaps.write(sourceMapWrite))
    .pipe(gulp.dest(paths.dist.css.dir));
});

gulp.task('clean:packageLock', function (callback) {
  del.sync(paths.base.packageLock.files);
  callback();
});

gulp.task('clean:dist', function (callback) {
  del.sync(paths.dist.base.dir);
  callback();
});

gulp.task('copy:all', function () {
  return gulp
    .src([
      paths.src.base.files,
      '!' + paths.src.scss.dir, '!' + paths.src.scss.files,
      '!' + paths.src.js.dir, '!' + paths.src.js.files, '!' + paths.src.js.main,
    ])
    .pipe(gulp.dest(paths.dist.base.dir));
});

gulp.task('copy:libs', function () {
  return gulp
    .src(npmdist({excludes: ['*.txt'],replaceDefaultExcludes: true}), { base: paths.base.node.dir })
    .pipe(rename(function (path) {
      path.dirname = path.dirname.replace(/\/dist/, '').replace(/\\dist/, '');
    }))
    .pipe(gulp.dest(paths.dist.libs.dir));
});

// for copy of src/js/forgotpassword.js
gulp.task('copy-lang', function() {
  return gulp.src('./src/js/*')
    .pipe(gulp.dest('./public/js'));
});

gulp.task('build', gulp.series(gulp.parallel('clean:packageLock', 'clean:dist', 'copy:all', 'copy:libs'), 'bootstrap', 'scss', 'icons'));

// gulp.task('default', gulp.series(gulp.parallel('clean:packageLock', 'clean:dist', 'copy:all', 'copy:libs', 'bootstrap', 'scss', 'icons', 'js', 'jsPages'), gulp.parallel('watch')));
gulp.task('default', gulp.series(gulp.parallel('clean:packageLock', 'clean:dist', 'copy:all', 'copy:libs', 'bootstrap', 'scss', 'icons', 'js', 'jsPages')));