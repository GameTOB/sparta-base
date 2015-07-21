'use strict';
/**
 * 不触发 $scope.$apply 的事件 (全集: http://fex.baidu.com/webuploader/doc/index.html#WebUploader_Uploader_events)：
 * 不触发依据：该事件存在关联事件用于触发，该事件不产生对View变化的可能性
 * dndAccept , beforeFileQueued , fileQueued , uploadStart ,
 * uploadBeforeSend , uploadAccept , uploadComplete
 */

angular.module('module')

.provider('Uploader', function() {

    this.defaults = {
        /**
         * 以下非webuploader的扩展配置项
         */

        /**
         * 以下为webuploader配置项
         */
        chunked: false,
        //accept: {
        //        title: 'Images',
        //        extensions: 'gif,jpg,jpeg,png',
        //        mimeTypes: 'image/*'
        //    },
        fileSingleSizeLimit: 1024 * 1024 * 5, //5M
        // compress: {
        //      // 图片质量，只有type为`image/jpeg`的时候才有效。
        //      quality: 90,
        //      // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
        //      allowMagnify: false,
        //      // 是否允许裁剪。
        //      crop: false,
        //      // 是否保留头部meta信息。
        //      preserveHeaders: true,
        //      // 如果发现压缩后文件大小比原来还大，则使用原来图片
        //      // 此属性可能会影响图片自动纠正功能
        //      noCompressIfLarger: true,
        //      // 单位字节，如果图片大小小于此值，不会采用压缩。
        //      compressSize: 0
        //  },
        //for Android
        //sendAsBinary:true
    };

    this.factory = function(options) {
        return window.WebUploader.create(options);
    };

    this.events = [];

    this.on = function(name, callback) {
        this.events.push([name, callback]);
    };

    this.$get = [

        function() {
            var factory = this.factory,
                defaults = this.defaults,
                events = this.events;

            return {
                create: function(options) {
                    var uploader = factory(angular.extend({}, defaults, options));

                    events.forEach(function(event) {
                        uploader.on(event[0], event[1]);
                    });

                    return uploader;
                }
            };
        }
    ];
})

.directive('uploaderInit', [

    function() {
        return {
            restrict: 'EA',
            scope: true,
            controller: 'uploaderCtrl'
        };
    }
])
    .directive('uploaderPick',
        function($timeout) {
            return {
                restrict: 'EA',
                scope: false,
                require: '^uploaderInit',
                link: function(scope, element, attrs) {
                    var isMultiple = function() {
                        var options = scope.$uploader.options;
                        //1 如果限制文件个数为1 则也只能单选 注意不限制个位数也符合可多选条件
                        //2 非1 时 属性multiple才管用
                        return +options.fileNumLimit != 1 && attrs.hasOwnProperty("pickMultiple");
                    }
                    $timeout(function() {
                        scope.$uploader.addButton({
                            id: element,
                            multiple: isMultiple()
                        });
                    }, 1);
                }
            };
        }
)

.directive('uploaderThumb', [

    function() {
        return {
            restrict: 'A',
            scope: false,
            require: '^uploaderInit',
            link: function(scope, element, attrs) {
                scope.$watch(attrs.uploaderThumb, function(file) {
                    if (!file) {
                        return;
                    }
                    scope.$uploader && scope.$uploader.makeThumb(file, function(error, src) {
                        src = error ? "http://placehold.it/120x128&text=noPreview" : src;
                        attrs.$set('src', src);
                    }, attrs.width || null, attrs.height || null);
                });
            }
        };
    }
])

.controller('uploaderCtrl', function($rootScope, $scope, $element, $attrs, $parse, $timeout, Uploader) {
    //console.log($element , $attrs);
    var options, uploaderName, $uploader;

    options = angular.extend({}, $scope.$eval($attrs.uploaderInit));
    //为了保持beforeUpload事件触发 在未修改WebUploader.js之前设置 auto = false;
    options.auto = false;
    //如果存在[uploader-dnd]则将其纳入dnd容器
    var dnd = $element.find("[uploader-dnd]");
    if (dnd.length > 0) {
        //console.log(dnd);
        options.dnd = dnd;
        options.disableGlobalDnd = true;
    }

    $uploader = Uploader.create(options);
    $scope.$uploader = $uploader;
    window.uploader = $uploader;

    uploaderName = $attrs.name || "uploader";


    /**
     * 修正及补充 方法及属性
     *
     */
    (function() {
        // $uploader.removeFile()
        // 强制清除文件及队列
        var removeFileFnt = $uploader.removeFile;
        $uploader.removeFile = function(file) {
            return removeFileFnt.apply($uploader, [file, true]);
        };

        // $uploader.uploaded
        // 至少有一次上传行为
        $uploader.uploaded = false;

        // $uploader.reset
        var resetFnt = $uploader.reset;
        $uploader.reset = function() {
            $uploader.uploaded = false;
            return resetFnt.apply($uploader);
        }

        // $uploader.files
        $uploader.files = [];
        // 复写 $uploader.upload , $uploader.retry
        // 增加 beforeUpload切面事件
        var retryFnt = $uploader.retry;
        $uploader.upload = $uploader.retry = function() {
            // console.log($uploader.trigger("beforeUpload"));
            if (!$uploader.trigger("beforeUpload")) {
                return;
            }
            return retryFnt.apply($uploader);
        };

        // $uploader.isFinished()
        $uploader.isFinished = function() {
            /*
             * * `successNum` 上传成功的文件数
             * * `progressNum` 上传中的文件数
             * * `cancelNum` 被删除的文件数
             * * `invalidNum` 无效的文件数
             * * `uploadFailNum` 上传失败的文件数
             * * `queueNum` 还在队列中的文件数
             * * `interruptNum` 被暂停的文件数
             */
            var stats = $uploader.getStats(),
                inited = $uploader.getFiles('inited');

            return $uploader.uploaded && inited.length == 0 && stats.progressNum == 0 && stats.interruptNum == 0 && stats.queueNum == 0 && stats.uploadFailNum == 0;
        };
    })();




    var timeOutFlag = true;
    var onAllHandler = function(eventName) {
        var args = Array.prototype.slice.call(arguments);
        args.shift();

        if (eventName == "error") {
            //修正error下的参数顺序
            var max, file, newArgs = [args[0]];
            switch (args[0]) {
                case "F_EXCEED_SIZE":
                case "Q_EXCEED_SIZE_LIMIT":
                case "Q_EXCEED_NUM_LIMIT":
                    max = args[1];
                    file = args[2];
                    newArgs.push(file, max);
                    break;
                case "Q_TYPE_DENIED":
                case "F_DUPLICATE":
                    file = args[1];
                    newArgs.push(file);
                    break;
            }
            args = newArgs;
        }
        var event = $rootScope.$broadcast.apply($rootScope, [uploaderName + '::' + eventName, $uploader].concat(args));

        //console.log('uploader::' + eventName, args);
        if (['filesQueued', 'fileDequeued', 'reset'].indexOf(eventName) > -1) {
            //坑爹的trigger('reset')会在处理之前就发出！
            //导致此刻getFiles还不是最新数据 
            //Todo：修 webuploader
            if (timeOutFlag) {
                timeOutFlag = false;
                $timeout(function() {
                    timeOutFlag = true;
                    $uploader.files = $uploader.getFiles();
                    $scope.$apply();
                }, 1);
            };
        }

        if (eventName == "startUpload") {
            $uploader.uploaded = true;
        }

        if (['stopUpload', 'startUpload', 'uploadProgress', 'error', 'uploadError', 'uploadSuccess', 'uploadFinished'].indexOf(eventName) > -1) {
            $
            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                $scope.$apply();
            }
        }

        if (event.defaultPrevented) {
            return false;
        }
    };

    $uploader.on('all', onAllHandler);
    $scope.$on('$destroy', function() {
        $uploader.off('all', onAllHandler);
    });

});