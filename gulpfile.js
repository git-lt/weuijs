var pkg = require('./package.json');
var gulp = require('gulp');
var concat = require('gulp-concat');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var browserSync = require('browser-sync');

// 构建
gulp.task('build:js', function (done) {
    var notes = [
        '/*!',
        ' * weui.js v<%= pkg.version %> (<%= pkg.homepage %>)',
        ' * Copyright <%= new Date().getFullYear() %>',
        ' * Licensed under the <%= pkg.license %> license',
        ' */',
        ''].join('\n');
    gulp.src('src/js/*.js')
        .pipe(concat('weui.js'))
        .pipe(header(notes, {pkg: pkg}))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'))
        .on('end', done);
});

gulp.task('build:css', function(done){
    gulp.src('src/css/*.css')
        .pipe(concat('weui-ext.css'))
        .pipe(gulp.dest('dist'))
        .on('end',done);
});

// 默认任务
gulp.task('default', ['build:js','build:css'], function(){
    browserSync.reload();
});

// 监听变动
gulp.task('watch', ['default', 'server'], function (){
    gulp.watch('src/**/*.*', ['default']);
});

// 清扫
gulp.task('clean', function() {  
  return gulp.src(['dist'], {read: false})
    .pipe(clean());
});

// 启动http浏览
gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        port: 8088,
        startPath: 'demo'
    });
});
