var gulp = require('gulp'),
    del  = require('del'),
    data = require('gulp-data'),
    sequence = require('gulp-sequence'),
    rename  = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    swig    = require('gulp-swig'),
    useref  = require('gulp-useref'),
    browserSync = require('browser-sync');

var config = require('../config/build'),
    fs = require('fs'),
    walker  = require('walker'),
    Q = require("q"), 
    appConf = require('../lib/app-conf'),
    appTask = require('../lib/app-task');

// /*实验任务 不起作用*/
// gulp.task("lab::rev", function(cb) {

//     appTask.start();

//     appTask.append("lab::rev::all", function(appkey){

//         var revAll = new RevAll();
//         return gulp.src(config.tmpDirectory + '/'+ appkey +'/**')
//             .pipe(revAll.revision())
//             .pipe(gulp.dest(config.destDirectory + '/'+ appkey));

//     });


//     appTask.finish(cb);

// });
// 

var scanDir = function(path){
    var deferred = Q.defer();
    var res = {};
    var pathLength = path.length;
    if(path && fs.lstatSync(path).isDirectory()){
        walker(path)
        .on('file' , function(file , stat){
            if(file.substr(-3)==".js"){
                //+1 是为了去掉 开头的目录分隔符 / 
                var relativeFile = file.substr(pathLength+1);
                var relativePaths = relativeFile.split("/");
                if(relativePaths.length>1){
                    if(!res[relativePaths[0]]){
                        res[relativePaths[0]] = [];
                    }
                    res[relativePaths[0]].push(relativeFile);
                }
            }
            
        })
        .on('end', function() {
            console.log(path + ' all files traversed.')
            deferred.resolve(res);
        });
    }else{
        deferred.resolve([]);
    }

    return deferred.promise;
};


gulp.task("dist::www", function(cb) {

    appTask.start();

    appTask.append("asset::www", function(appkey){

        var userefAssets = useref.assets();

        return gulp.src(config.srcDirectory + '/apps/'+ appkey +'/*.html')
            .pipe(plumber())
            .pipe(data(function(){
                var deferred = Q.defer();

                var result = {
                    AppJsFiles : {},
                    FrameworkJsFiles : {},
                    AppConf : appConf.read()?appConf.read()[appkey]:{},
                    Env : process.env.NODE_ENV
                };
                
                var paths = {
                    app : process.env.PWD +'/'+config.destDirectory+ '/apps/'+ appkey +'/app',
                    framework : process.env.PWD +'/'+config.destDirectory+'/framework',
                    moduleUI : process.env.PWD +'/'+config.destDirectory+'/module/ui'
                }; 
                
                Q.all([scanDir(paths.framework) , scanDir(paths.app)]).then(function(data){
                    result.FrameworkJsFiles = data[0];
                    result.AppJsFiles = data[1];
                    //console.log(result);
                    deferred.resolve(result);
                });

                return deferred.promise;
            }))
            .pipe(swig({defaults: { cache: false }}))
            
            //这些userref步骤实际当中非必须用到
            .pipe(userefAssets)
            .pipe(userefAssets.restore())
            .pipe(useref())
            
            .pipe(gulp.dest(config.destDirectory + '/apps/'+ appkey))
            .pipe(browserSync.reload({stream:true}));
    });


    appTask.finish(cb);

});

gulp.task("buildDist", function(cb) {

    sequence("dist::www", cb);

});