﻿/// <reference path="/Content/Code/LCL.JQuery.Base.js" /> 
/// <reference path="/Content/Core/LCL.JQuery.Core.js" /> 
/// <reference path="/Content/Core/LCL.JQuery.JSON.js" /> 
/// <reference path="/Content/Core/LCL.JQuery.Plugins.js" /> 

//页面属性PageAttr （该行不允许删除） 
var pageAttr = {
    SiteRoot: '',
    LanguageId: '2052',
    JsonServerURL: '',
    Added: true,
    Toolbar: '',
    RoutId: ''
};
//页面入口 
$(document).ready(function () {
    //debugger;
    InitAttribute();
    InitLanguage();
    InitControls();
    InitEvent();
});
//初始化页面属性 
function InitAttribute() {
    pageAttr.SiteRoot = $.LCLBase.SiteConfig.GetSiteRoot();
    pageAttr.LanguageId = $.LCLBase.SiteConfig.GetCurrLanguageID();
    pageAttr.JsonServerURL = pageAttr.SiteRoot + 'UIShell.RbacManagementPlugin/';
    pageAttr.RoutId = routId;// $.LCLCore.Request.QueryString("routId")
}
//初始化多语言 
function InitLanguage() {
    $.LCLPageModel.Resource.InitLanguage();
}
//初始化控件 
function InitControls() {
    InitGrid();
}
//初始化事件 
function InitEvent() {
    $('#btnAddwfactor').click(function () { pageFunc_wfactorAdd(); });
    $('#btnDelwfactor').click(function () { pageFunc_wfactorDel(); });
    //$('#btnSearchwfactor').click(function () { pageFunc_SearchDatawfactor(); });

    $('#btnSearcwfactoruser').click(function () { pageFunc_EmpSingleSelect(); });
}
function InitGrid() {
    $('#grid_wfactor').datagrid({
        url: pageAttr.JsonServerURL + 'WFActor/AjaxGetByRoutId?routId=' + pageAttr.RoutId,
        iconCls: 'icon-edit',
        pagination: true,
        rownumbers: true,
        fitCloumns: true,
        idField: "ID",
        frozenColumns: [[
          { field: 'ck', checkbox: true }
        ]],
        hideColumn: [[
           { title: 'ID', field: 'ID' }
        ]],
        columns: [[
                { field: 'SortNo', title: $.LCLPageModel.Resource.PageLanguageResource.WFActor_Model_SortNo, width: 100 },
                { field: 'Name', title: $.LCLPageModel.Resource.PageLanguageResource.WFActor_Model_Name, width: 100 },
                {
                    field: 'opt', title: $.LCLPageModel.Resource.PageLanguageResource.Page_Command_Grid_Operate, width: 120, align: 'center',
                    formatter: function (value, rec, index) {
                        return '&nbsp;<a href="javascript:void(0)" class="easyui-linkbutton" iconcls="icon-search" plain="true" onclick="pageFunc_EmpSingleSelect(\'' + rec.ID + '\')">权限</a>&nbsp;'
                             + '&nbsp;<a href="javascript:void(0)" class="easyui-linkbutton" iconcls="icon-edit" plain="true" onclick="pageFunc_wfactorEdit(\'' + rec.ID + '\')">' + $.LCLPageModel.Resource.PageLanguageResource.Page_Command_Edit + '</a>&nbsp;'
                             + '&nbsp;<a href="javascript:void(0)" class="easyui-linkbutton" iconcls="icon-remove" plain="true" onclick="pageFunc_wfactorDel()"> ' + $.LCLPageModel.Resource.PageLanguageResource.Page_Command_Del + '</a>&nbsp;';
                    }
                }
        ]],
        toolbar: grid_wfactor_toolbar(),
        onDblClickRow: function (rowIndex, rowData) {
            $('#grid_wfrout').datagrid('clearSelections').datagrid('clearChecked').datagrid('checkRow', rowIndex);
            pageFunc_wfactorEdit(rowData.ID);
        }, onLoadSuccess: function (data) {
            if (data.total == 0) {
                //添加一个新数据行，第一列的值为你需要的提示信息，然后将其他列合并到第一列来，注意修改colspan参数为你columns配置的总列数
                $(this).datagrid('appendRow', { itemid: '<div style="text-align:center;color:red">没有相关记录！</div>' }).datagrid('mergeCells', { index: 0, field: 'itemid', colspan: 4 })
                //隐藏分页导航条，这个需要熟悉datagrid的html结构，直接用jquery操作DOM对象，easyui datagrid没有提供相关方法隐藏导航条
                $(this).closest('div.datagrid-wrap').find('div.datagrid-pager').hide();
            }
                //如果通过调用reload方法重新加载数据有数据时显示出分页导航容器
            else $(this).closest('div.datagrid-wrap').find('div.datagrid-pager').show();
        }
    });
}
function pageFunc_SearchDatawfactor() {
    $("#grid_wfactor").datagrid('load', {
        Name: $('#ui_wfrout_search').find('[name=Keyword]').val()
    });
    clearSelect('grid_wfactor');
}
function pageFunc_wfactorAdd() {
    pageAttr.Added = true;

    $('#ffwfactor').form('clear');
    $('#wfactor_Entity_SortNo').numberspinner('setValue', 1);  // 设置值

    $('#win_wfactor').dialog({
        title: $.LCLPageModel.Resource.PageLanguageResource.Page_Command_Add,
        width: 500,
        height: 280,
        iconCls: 'icon-add',
        modal: true,
        buttons: [{
            id: 'btnSavewfactor',
            iconCls: 'icon-ok',
            text: $.LCLPageModel.Resource.PageLanguageResource.Page_Command_Save,
            handler: function () {
                pageFunc_wfactorSave();
            }
        }, {
            id: 'btnCancelwfrout',
            iconCls: 'icon-cancel',
            text: $.LCLPageModel.Resource.PageLanguageResource.Page_Command_Cancel,
            handler: function () {
                closeDialog('win_wfactor');
            }
        }]
    });
}
function pageFunc_wfactorEdit(ID) {
    if (ID != undefined && ID.length > 0) {
        pageAttr.Added = false;
        $('#win_wfactor').dialog({
            title: $.LCLPageModel.Resource.PageLanguageResource.Page_Command_Edit,
            width: 550,
            height: 280,
            iconCls: 'icon-edit',
            modal: true,
            buttons: [{
                id: "btnSavewfactor",
                iconCls: 'icon-ok',
                text: $.LCLPageModel.Resource.PageLanguageResource.Page_Command_Save,
                handler: function () {
                    pageFunc_wfactorSave();
                }
            }, {
                id: 'btnCancelwfactor',
                iconCls: 'icon-cancel',
                text: $.LCLPageModel.Resource.PageLanguageResource.Page_Command_Cancel,
                handler: function () {
                    closeDialog('win_wfactor');
                }
            }],
            onClose: function () {
                closeDialog('win_wfactor');
            }
        });
        var ajaxUrl = pageAttr.JsonServerURL + 'wfactor/AjaxGetByModel?id=' + $.LCLCore.ValidUI.Trim(ID);
        $.post(ajaxUrl, function (resultData) {
            if (resultData.Success) {
                $('#wfactor_Entity_ID').val(resultData.DataObject.ID);
                $('#wfactor_Entity_SortNo').numberspinner('setValue', resultData.DataObject.SortNo);  // 设置值
                $('#wfactor_Entity_Name').val(resultData.DataObject.Name);
                $('#wfactor_Entity_IsDelete').val(resultData.DataObject.IsDelete);
                $('#wfactor_Entity_AddDate').val(resultData.DataObject.AddDate);
                $('#wfactor_Entity_UpdateDate').val(resultData.DataObject.UpdateDate);
                $('#Entity_Rout_ID').val(pageAttr.RoutId);
            }
        }, 'json');

    } else {
        $.LCLMessageBox.Alert($.LCLPageModel.Resource.PageLanguageResource.LCLMessageBox_Message1);
    }
}
function pageFunc_wfactorSave() {
    var ajaxUrl = "";
    if (pageAttr.Added) {
        ajaxUrl = pageAttr.JsonServerURL + 'WFActor/AjaxAdd';
    } else {
        ajaxUrl = pageAttr.JsonServerURL + 'WFActor/AjaxEdit';
    }

    $('#ffwfactor').form('submit', {
        url: ajaxUrl,
        onSubmit: function (param) {
            $('#btnSavewfactor').linkbutton('disable');
            param.ID = $('#wfactor_Entity_ID').val();
            param.SortNo = $('#wfactor_Entity_SortNo').numberspinner('getValue');
            param.Name = $('#wfactor_Entity_Name').val();
            param.IsDelete = $('#wfactor_Entity_IsDelete').val();
            param.AddDate = $('#wfactor_Entity_AddDate').val();
            param.UpdateDate = $('#wfactor_Entity_UpdateDate').val();

            param.Rout_ID = pageAttr.RoutId;

            if ($(this).form('validate'))
                return true;
            else {
                $('#btnSavewfactor').linkbutton('enable');
                return false;
            }
        },
        success: function (data) {
            var resultData = eval('(' + data + ')');
            if (resultData.Success) {
                flashTable('grid_wfactor');
                if (pageAttr.Added) {

                } else {
                    closeDialog('win_wfactor');
                }
            }
            $('#btnSavewfactor').linkbutton('enable');
            $.LCLMessageBox.Alert(resultData.Message);
        }
    });
}
function pageFunc_wfactorDel() {
    var rows = $("#grid_wfactor").datagrid("getChecked");
    if (rows.length < 1) {
        $.LCLMessageBox.Alert($.LCLPageModel.Resource.PageLanguageResource.LCLMessageBox_Message2);
        return;
    }
    var parm;
    $.each(rows, function (i, row) {
        if (i == 0) {
            parm = "idList=" + row.ID;
        } else {
            parm += "&idList=" + row.ID;
        }
    });
    $.LCLMessageBox.Confirm($.LCLPageModel.Resource.PageLanguageResource.LCLMessageBox_Message3, function (r) {
        if (r) {
            $.post(pageAttr.JsonServerURL + 'WFActor/AjaxDeleteList/', parm,
            function (resultData) {
                if (resultData.Success) {
                    $.LCLMessageBox.Alert(resultData.Message, function () {
                        InitGrid();
                    });
                } else {
                    $.LCLMessageBox.Alert(resultData.Message);
                }
            }, "json");
        }
    });
}
function grid_wfactor_toolbar() {
    var ihtml = '<div id="tbar_wfactor">'
        + '<a id="btnAddwfactor" href="javascript:;" plain="true" class="easyui-linkbutton" icon="icon-add">' + $.LCLPageModel.Resource.PageLanguageResource.Page_Command_Add + '</a>&nbsp;'
        + '<a id="btnDelwfactor" href="javascript:;" plain="true" class="easyui-linkbutton" icon="icon-remove">' + $.LCLPageModel.Resource.PageLanguageResource.Page_Command_Del + '</a>&nbsp;'
        + '<a href="javascript:void(0)" /></div>'
    return ihtml;
}

function pageFunc_EmpSingleSelect(ID) {
    $("<div/>").dialog({
        id: "ui_UserSelect_dialog",
        href: pageAttr.JsonServerURL + "User/UserSelect?actorid=" + ID,
        title: "选择用户",
        iconCls: 'icon-edit',
        width: 500,
        height: 350,
        modal: true,
        buttons: [{
            id: "ui_UserSelect_btn",
            text: '确 定',
            iconCls: "icon-ok",
            handler: function () {
                var parm = 'actorId=' + ID;
                $("#litGrant option").each(function (i) {
                    parm += "&idUserList=" + this.value;
                });
                debugger;
                if (parm.length > 0) {
                    $.LCLMessageBox.Confirm($.LCLPageModel.Resource.PageLanguageResource.LCLMessageBox_Message4, function (r) {
                        if (r) {
                            //页面遮盖层
                            $(document.body).LoadingMask($.LCLBase.SiteConfig.GetCurrLanguageID());
                            var ajaxUrl = pageAttr.JsonServerURL + 'WFActor/AjaxAddActorUser/';
                            $.post(ajaxUrl, parm,
                            function (resultData) {
                                if (resultData.Success) {
                                    $.LCLMessageBox.Alert(resultData.Message, function () {
                                        InitGrid();
                                    });
                                } else {
                                    $.LCLMessageBox.Alert(resultData.Message);
                                }
                                $(document.body).UnLoadingMask();
                            }, "json");
                        }
                    });
                }
            }
        }]
    });
}
