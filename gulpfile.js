var gulp = require('gulp');
var postHtml = require('gulp-posthtml');
var include = require('posthtml-include');
var del = require('del');
var sourceMaps = require('gulp-sourcemaps');
var groupMedia = require('gulp-group-css-media-queries');
var minifyCss = require('gulp-clean-css');
var rename = require('gulp-rename');
var imageMin = require('gulp-imagemin');
var plumber = require('gulp-plumber');
var gulpIf = require('gulp-if');
var browserSync = require("browser-sync").create();
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var postCss = require('gulp-postcss');
var autoPrefixer = require('autoprefixer');

var env = process.env.NODE_ENV;
var config = {
	SRC_PATH: `src`,
	BUILD_PATH: `build`
}

var reload = (done) => {
  	browserSync.reload();
  	done();
}

var html = () => {
	return gulp.src(`${config.SRC_PATH}/*.html`)
		.pipe(plumber())
		.pipe(postHtml([
			include()
		]))
		.pipe(gulp.dest(`${config.BUILD_PATH}`));
}

var clean = () => del(`${config.BUILD_PATH}`);

var styles = () => {
	return gulp.src(`${config.SRC_PATH}/sass/style.scss`)
		.pipe(plumber())
		.pipe(gulpIf(env === `dev`, sourceMaps.init()))
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(gulpIf(env === `prod`, groupMedia()))
		.pipe(gulpIf(env === `prod`, postCss([
			autoPrefixer()
		])))
		.pipe(gulpIf(env === `dev`, sourceMaps.write(`.`)))
		.pipe(gulpIf(env === `dev`, gulp.dest(`${config.BUILD_PATH}/css`)))
		.pipe(rename(`style.min.css`))
		.pipe(minifyCss())
		.pipe(gulp.dest(`${config.BUILD_PATH}/css`));
}

var images = () => {
	return gulp.src(`${config.SRC_PATH}/img/**/*.+(jpg|png)`)
		.pipe(gulpIf(env === `prod`, imageMin([
			imageMin.mozjpeg({quality: 75, progressive: true}),
			imageMin.optipng()
		])))
		.pipe(gulp.dest(`${config.BUILD_PATH}/img`));
}

var server = () => {
  	browserSync.init({
		server: `${config.BUILD_PATH}`,
		open: true
	})
}

var watch = () => {
	gulp.watch(`${config.SRC_PATH}/*.html`, gulp.series(html, reload));
	gulp.watch(`${config.SRC_PATH}/sass/**/*.scss`, gulp.series(styles, reload));
	gulp.watch(`${config.SRC_PATH}/img/**/*.+(jpg|png|svg)`, gulp.series(images, reload));
}

gulp.task(`default`,
	gulp.series(clean, gulp.parallel(images, styles, html), gulp.parallel(watch, server))
);
