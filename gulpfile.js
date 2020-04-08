var gulp 						= require('gulp');
var sass						= require('gulp-sass');
var browserSync			= require('browser-sync');
var sourcemaps			= require('gulp-sourcemaps');
var autoprefixer		= require('gulp-autoprefixer');
var rename 					= require('gulp-rename');
var	uglify					= require('gulp-uglifyjs');
//var	cssnano					= require('gulp-cssnano');
var	del 						= require('del');
var	imagemin				= require('gulp-imagemin');
var	pngquant				= require('imagemin-pngquant');
var	cache						= require('gulp-cache');

gulp.task('sass', function (cb) {
	return gulp.src('app/sass/**/*.sass') // Берем источник
	.pipe(sourcemaps.init())
	.pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
	.pipe(sourcemaps.write())
	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
	.pipe(rename({ suffix: '.min' })) // Добавляем суффикс .min
	.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
	.pipe(browserSync.reload({ stream: true })) // Обновляем CSS на странице при изменении
	cb();
});

gulp.task('browser-sync', function () {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		tunnel: false,
		host: 'localhost',
		port: 8081,
		logPrefix: "ASY1"
	});
});

gulp.task('prebuild', async function () {

	var buildCss = gulp.src('app/css/main.min.css')
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src('app/js/**/*')
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));

	var buildLibs = gulp.src('app/libs/**/*')
	.pipe(gulp.dest('dist/libs'));

});

gulp.task('img', function () {
	return gulp.src('app/templates/ksu/img/**/*')
//.pipe(imagemin({ // Сжимаем изображения без кеширования
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{ removeViewBox: false }],
		use: [pngquant()]
	})))
	.pipe(gulp.dest('dist/templates/ksu/img')); // Выгружаем на продакшен
});

gulp.task('js', function () {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		])
//.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('code', function () {
	return gulp.src('app/*.html')
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('watch', function () {
	gulp.watch('app/sass/**/*.sass', gulp.parallel('sass'));
	gulp.watch('app/*.html', gulp.parallel('code'));
});

gulp.task('clean', async function () {
	return del.sync('dist');
});

gulp.task('default', gulp.parallel('sass', 'browser-sync', 'watch'));
gulp.task('build', gulp.parallel('prebuild', 'clean', 'img', 'sass', 'js'));