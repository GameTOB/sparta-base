var gulp = require('gulp'),
    del = require('del'),
    sequence = require('gulp-sequence'),
    data = require('gulp-data'),
    rename = require('gulp-rename'),
    gulpif = require('gulp-if'),
    autoprefixer = require('autoprefixer-core'),
    plumber = require('gulp-plumber'),
    less = require('gulp-less'),
    postcss = require('gulp-postcss'),
    swig = require('gulp-swig'),
    ngHtml2js = require('gulp-ng-html2js'),
    ngAnnotate = require('gulp-ng-annotate'),
    markdown = require('gulp-markdown'),
    concat = require('gulp-concat'),
    browserSync = require('browser-sync');

var config = require('../config/build'),
    path = require('path'),
    appConf = require('../lib/app-conf'),
    appTask = require('../lib/app-task');


var buildScriptTask = function(rootDir,isInApp){
    isInApp = isInApp || false;

    return function(appkey){
        var src = isInApp ? config.srcDirectory+'/apps/'+appkey+'/'+ rootDir +'/**/*.js' :  config.srcDirectory+'/'+rootDir +'/**/*.js',
            dest = isInApp ? config.destDirectory+'/apps/'+appkey+'/'+ rootDir  : config.destDirectory+'/'+ rootDir;
        var tempStream = null;
            tempStream = gulp.src( src )
                .pipe(plumber());
            if (process.env.NEED_WATCH !="true") {
                tempStream = tempStream.pipe(ngAnnotate());
            }
            return tempStream.pipe(gulp.dest( dest ))
                .pipe(browserSync.reload({
                    stream: true
                }));
    };

};

var buildStyleTask = function(rootDir,isInApp){
    isInApp = isInApp || false;

    return function(appkey){
        var src = isInApp ? config.srcDirectory+'/apps/'+appkey+'/' + rootDir +'/**/*.{css,less}' : config.srcDirectory+'/'+rootDir +'/**/*.{css,less}',
            dest = isInApp ? config.destDirectory+'/apps/'+appkey+'/'+ rootDir  : config.destDirectory+'/'+ rootDir; 
        return gulp.src( src )
            .pipe(less({
                paths: [path.join(__dirname, 'less', 'includes')]
            }))
            .pipe(postcss([autoprefixer({
                browsers: ['last 1 version']
            })]))
            .pipe(rename({
                extname: ".css"
            }))
            .pipe(gulp.dest( dest ))
            .pipe(browserSync.reload({
                stream: true
            }));
    };
};

var buildTemplateTask = function(rootDir , option , isInApp){
    isInApp = isInApp || false;

    return function(appkey){
        var src = isInApp ? config.srcDirectory+'/apps/'+appkey+'/' + rootDir +'/**/*.{tpl,md}' : config.srcDirectory+'/'+rootDir +'/**/*.{tpl,md}',
            dest = isInApp ?  config.destDirectory+'/apps/'+appkey+'/'+ rootDir : config.destDirectory+'/'+ rootDir ;
        return gulp.src( src )
            .pipe(plumber())
            .pipe(gulpif('*.md', markdown()))
            .pipe(rename({
                extname: ".tpl"
            }))
            .pipe(ngHtml2js({
                moduleName: option.moduleName||"",
                prefix: option.prefix||""
            }))
            .pipe(concat("template.js"))
            .pipe(gulp.dest( dest ))
            .pipe(browserSync.reload({stream: true}));
    };

};

gulp.task('asset::apps', function(cb) {

    appTask.start();

    appTask.append("asset::script::app", buildScriptTask('app' , true) );

    appTask.append("asset::style::app", buildStyleTask('app' , true) );

    appTask.append("asset::template::app", buildTemplateTask('app/template' , {
        moduleName : "app" ,
        prefix : "app/template/"
    } , true));

    appTask.finish(cb);

});

gulp.task('asset::module', function(cb) {
    var tasks = [];

    gulp.task("asset::script::module", function() {
        //套一下 保证appkey参数undefined
        return buildScriptTask('module')();
    });
    tasks.push("asset::script::module");
    gulp.task("asset::style::module", function() {
        return buildStyleTask('module')();
    });
    tasks.push("asset::style::module");
    gulp.task("asset::template::module", function() {
        return buildTemplateTask('module/ui/template' , {
            moduleName : "module" ,
            prefix : "module/ui/template/"
        })();
    });
    tasks.push("asset::template::module");

    tasks.push(cb);
    sequence.apply(this, tasks);

});

gulp.task('asset::framework', function(cb) {

    var tasks = [];
    
    gulp.task("asset::script::framework", function() {
        //套一下 保证appkey参数undefined
        return buildScriptTask('framework')();
    });
    tasks.push("asset::script::framework");
    gulp.task("asset::style::framework", function() {
        return buildStyleTask('framework')();
    });
    tasks.push("asset::style::framework");
    gulp.task("asset::template::framework", function() {
        return buildTemplateTask('framework/template' , {
            moduleName : "framework" ,
            prefix : "framework/template/"
        })();
    });
    tasks.push("asset::template::framework");

    tasks.push(cb);
    sequence.apply(this, tasks);

});

gulp.task("buildAsset", function(cb) {

    sequence("asset::apps", "asset::module", "asset::framework", cb);

});
