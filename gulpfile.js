var pkg = require('./package.json');
var gulp = require('gulp');
var tap = require('gulp-tap');
var babel = require('gulp-babel');
var order = require('gulp-order');
var concat = require('gulp-concat');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var browserSync = require('browser-sync');

// 构建
gulp.task('build:js', function (done) {
    var banner = [
        '/*!',
        ' * WeUI.js v<%= pkg.version %> (<%= pkg.homepage %>)',
        ' * Copyright <%= new Date().getFullYear() %>',
        ' * Licensed under the <%= pkg.license %> license',
        ' */',
        ''].join('\n');
    gulp.src('src/*.js')
        .pipe(tap(function (file) {
            var content = file.contents.toString();
            content = content.replace(/@VERSION/g, pkg.version);
            file.contents = new Buffer(content);
        }))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(order([
            'weui.js',
            'dialog.js',
            'alert.js',
            'toptips.js',
            '*.js'
        ]))
        .pipe(concat('weui.js'))
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest('dist'))
        .on('end', done);
});

// 示例
gulp.task('build:example', function (done) {
    gulp.src('src/example/**/*.*')
        .pipe(gulp.dest('dist/example'))
        .on('end', done);
});

// 默认任务
gulp.task('default', ['build:js', 'build:example'], function(){
    browserSync.reload();
});

// 监听变动
gulp.task('watch', ['default', 'server'], function (){
    gulp.watch('src/**/*.*', ['default']);
});

// 启动http浏览
gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        port: 8088,
        startPath: '/example'
    });
});
