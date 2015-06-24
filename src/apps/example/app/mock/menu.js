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

    ApiMock.reg('/menu/get', [createMenuNode(1000, "管理面板", "", [
        createMenuNode(1001, "系统成员", "/master/member"),
        createMenuNode(1002, "市场客户", "",[
            createMenuNode(10021, "三级菜单0", "/master/custom0"),
            createMenuNode(10022, "三级菜单1", "/master/custom1")
            ]),
        createMenuNode(1003, "企业职工", "/master/deployee"),
        createMenuNode(1004, "特别关系", "/master/special")]),
        createMenuNode(2000, "日程计划", "/todo/summary", [
        createMenuNode(2001, "过去", "/todo/passed"),
        createMenuNode(2002, "当下", "/todo/now"),
        createMenuNode(2003, "未来", "/todo/future")]),
        createMenuNode(3000, "三级菜单1", "/threeMenu/1", [
        createMenuNode(3001, "三级菜单2", "/threeMenu/2", [
        createMenuNode(3002, "三级菜单3", "/threeMenu/3")])])
    ]);

    // ApiMock.reg('/menu/get', [
    //     createMenuNode(1000, "说明", "/readme"),
    
    // ]);

});
