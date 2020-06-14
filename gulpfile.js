const gulp = require('gulp');
const postHtml = require('gulp-posthtml');
const include = require('posthtml-include');
const del = require('del');
const concat = require('gulp-concat');
const sourceMaps = require('gulp-sourcemaps');
const postCss = require('gulp-postcss');
const autoPrefixer = require('autoprefixer');
const groupMedia = require('gulp-group-css-media-queries');
const minifyCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const imageMin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const gulpIf = require('gulp-if');
const browserSync = require("browser-sync").create();
const webp = require('gulp-webp');

const reload = browserSync.reload;
const env = process.env.NODE_ENV;
const config = {
	SRC_PATH: `src`,
	BUILD_PATH: `build`
}

const html = () => {
	return gulp.src(`${config.SRC_PATH}/*.html`)
		.pipe(plumber())
		.pipe(postHtml([
			include()
		]))
		.pipe(gulp.dest(`${config.BUILD_PATH}`));
}

const clean = () => del(`${config.BUILD_PATH}`);

const styles = () => {
	return gulp.src(`${config.SRC_PATH}/css/**/*.css`)
		.pipe(plumber())
		.pipe(gulpIf(env === `dev`, sourceMaps.init()))
		.pipe(concat(`style.css`))
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

const images = () => {
	return gulp.src(`${config.SRC_PATH}/img/**/*.+(jpg|png)`)
		.pipe(gulpIf(env === `prod`, imageMin([
			imageMin.mozjpeg({quality: 75, progressive: true}),
			imageMin.optipng()
		])))
		.pipe(gulp.dest(`${config.BUILD_PATH}/img`));
}

const webpImg = () => {
	return gulp.src(`${config.SRC_PATH}/img/**/*.+(jpg|png)`)
		.pipe(gulpIf(env === `prod`, webp({quality: 90})))
		.pipe(gulp.dest(`${config.BUILD_PATH}/img`));
}

const server = () => {
  	browserSync.init({
		server: `${config.BUILD_PATH}`,
		open: true
	})
}

const watch = () => {
	gulp.watch(`${config.SRC_PATH}/*.html`, gulp.series(html, reload));
	gulp.watch(`${config.SRC_PATH}/css/**/*.css`, gulp.series(styles, reload));
	gulp.watch(`${config.SRC_PATH}/img/**/*.+(jpg|png|svg)`, gulp.series(images, reload));
}

gulp.task(`default`,
	gulp.series(clean, gulp.parallel(images, styles, html, webpImg), gulp.parallel(watch, server))
);
