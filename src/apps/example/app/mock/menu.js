angular.module('framework')

.run(function (ApiMock) {

    var createMenuNode = function(id, title, url, children) {
        var node = {
            id: id,
            title: title,
            url: url
        };
        if (children && children.length > 0) {
            node.children = children;
        };
        return node;
    };

    ApiMock.reg('/menu/get', [
        createMenuNode(1000, "说明", "/readme"),
    
    ]);

});
