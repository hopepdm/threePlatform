/**
 * Created by Jabinzou on 2017/3/16.
 */
//弹窗
(function (window, $, undefined) {
    var $modal = $('.new_project');
    var $content = $('.modal_content');
    var $load = $('.change_modal');
    var $close = $('.close');

    function modal(openObj, target, modal, close) {
        $(openObj).on('click', function () {
            $(target).slideDown(300, function () {
                $(modal).animate({
                    'opacity': '1'
                }, 800);
            })
        });
        $(close).on('click', function () {
            $(target).animate({
                'width': '0',
                'opacity': '0'
            }, 500, function () {
                $(this).css({
                    'width': '100%',
                    'display': 'none',
                    'opacity': '1'
                });
            })
        })
    }
    modal($load, $modal, $content, $close);
})(window, $)

/**
 * error page
 */
$(function () {
    var $back = $('.back_up');
    var $refresh = $('.refresh');
    $($back).on('click', function () {
        window.history.back();
        self.location = document.referrer;
    });
    $($refresh).on('click', function () {
        window.location.reload();
    })
    /**
     * upload页面
     */
    //--拖拽上传--//

    var $drag_load = $('.drag_load');
    var $span = $('.up_load_title');
    var $info = $('.up_load_title');
    //目标区域
    $drag_load.on({
        dragover: function (ev) {
            var ev = ev || window.event;
            $($span).html('松开鼠标后进行上传');
            ev.preventDefault();
        },
        drop: function (ev) {
            var ev = ev || window.event;
            ev.preventDefault(); //必须阻止dragenter和over事件才能响应
            var oFile = ev.originalEvent.dataTransfer.files; //由于jquery的封装，所以此处的e采用e.originalEvent否则不能生效
            var len = oFile.length;
            var i = 0;
            var info = '';
            while (i < len) {
                info += oFile[i].name + '\n';
                i++;
            }
            $($info).html(info);
            if (oFile.length == 0) {
                return false;
            }
            console.log(oFile);
            var fileName = oFile[0].name.substring(oFile[0].name.lastIndexOf('.') + 1);
            if (fileName !== 'zip') {
                alert('请上传压缩文件'); //必须上传压缩文件
                return false;
            }

            $('.progress').fadeIn('400');
            var obj = $('.progress_bar');
            var fd = new FormData();
            fd.append('model', oFile[0]); //前后字段名必须相同（后端是model命名的）
            function onprogress(ev) {
                var ev = ev || window.event;
                var tot = ev.total;
                var loaded = ev.loaded; //已经上传大小情况
                //附件总大小
                var per = Math.floor(loaded * 42 / tot); //已经上传的百分比
                $(obj).css("width", per + "rem");
                if (per == 42) {
                    $(obj).css("width", "42rem");
                    $('.divnum li:nth-child(11)').addClass('z-on');
                }
            }
            $('.publish_item').click(function (e) { //点击发布触发ajax
                e.preventDefault();
                $.ajax({
                    type: 'post',
                    url: '/api/upload',
                    data: fd,
                    cache: false,
                    contentType: false,
                    processData: false,
                    xhr: function () { //ajax中的xhr的事件用于监听上传事件
                        var xhr = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
                        console.log('go');
                        var xhr = $.ajaxSettings.xhr();
                        if (onprogress && xhr.upload) {
                            if (addEventListener) {
                                xhr.upload.addEventListener("progress", onprogress, false);
                            } else {
                                xhr.upload.attachEvent("onprogress", onprogress);
                            }
                            return xhr;
                        }
                    },
                    success: function (data) {
                        alert('上传成功');
                        window.location.reload()
                    },
                    err: function (err) {
                        alert(err);
                    }
                });

            });



        },
        dragleave: function (ev) {
            var ev = ev || window.event;
            $($span).html('拖拉文件到虚线框内上传');
            ev.preventDefault();
        }
    })

    /**
     * 编辑弹窗
     */
    var $close = $('.close');
    var $modal = $('.edit_modal');
    var $content = $('.modal_content');
    $('.file_edit').on('click', function () {
        var pattern1 = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
        var pattern2 = /^[A-Za-z0-9_]+$/;
        var gid = $(this).attr('data-id');
        $($modal).slideDown(300, function () {
            $($content).animate({
                'opacity': '1'
            }, 800);
        });
        //提交表单更新数据库
        $('.confirm input').on('click', function (e) {
            e.preventDefault(); //这里是阻止按钮默认提交的事件
            var title = $('input[name=pageTitle]').val();
            var name = $('input[name=pageName]').val();

            if (pattern1.test($('input[name=pageTitle]').val()) == false) {
                $('.title').addClass('warn').text('请输入正确格式(包含汉字,数字,字母,下划线)');
                return false;
            }
            if (pattern2.test($('input[name=pageName]').val()) == false) {
                $('.nama').addClass('warn').text('请输入正确格式(包含数字,字母,下划线)');
                return false;
            }
            if (pattern1.test($('input[name=pageTitle]').val()) && pattern2.test($('input[name=pageName]').val())) {
                $.ajax({
                    type: 'post',
                    url: '/culturalUp',
                    data: {
                        id: gid,
                        pageTitle: title,
                        pageName: name
                    },
                    dataType: 'json',
                    success: function () {
                        console.log('修改成功');
                    },
                    error: function () {
                        console.log('修改失败');
                    }
                });
            }
            window.location.reload(); //避免路由处理数据后页面的跳转
        });

    });

    $close.on('click', function () {
        $($modal).animate({
            'width': '0',
            'opacity': '0'
        }, 500, function () {
            $(this).css({
                'width': '100%',
                'display': 'none',
                'opacity': '1'
            });
        });
    });

    /**
     * 全选，反选，删除操作
     */

    var target = $('input[type=checkbox]');
    var value = $('.chose');
    if (target.length <= 1) {
        $('.mime').hide('ease');
        $(value).text('寂寞').addClass('warn');
    }
    $('.select-all').on('click', function () {
        if (this.checked) {
            $(target).prop('checked', true);
            $(value).text('不选');
        } else {
            $(target).prop('checked', false);
            $(value).text('全选');
        }

    });
    $(target).on('click', function () {
        var allNum = target.length;
        var todo = 0;
        $(target).each(function () {
            if ($(this).prop('checked') == true) {
                todo++;
            }
        })
        if (allNum == todo) {
            $('.select-all').prop('checked', true);
        } else {
            $('.select-all').prop('checked', false);
        }
    })

    /* *
     * 删除模型文件弹窗操作
     * */

    $('.file_delete').on('click', function () {
        var $modal = $('.file_confirm');
        var uid = $(this).attr('data-id');
        var todo_name = $(this).attr('data-name');
        $('.confirm_name').text('文件:' + todo_name);
        $($modal).slideDown(300, function () {
            $($content).animate({
                'opacity': '1'
            }, 800);
        });
        $('.abort').on('click', function () {
            $.ajax({
                type: 'post',
                url: '/api/delete',
                data: {
                    id: uid
                },
                //dataType: 'json',
                success: function (dt) {
                    console.log(dt);
                },
                error: function () {
                    console.log('ajax err:' + uid);
                }
            });
            $(this).parents('tr').remove();
            $($modal).animate({
                'width': '0',
                'opacity': '0'
            }, 500, function () {
                $(this).css({
                    'width': '100%',
                    'display': 'none',
                    'opacity': '1'
                });
            })
            window.location.reload();
        });
        $('.cancel').on('click', function () {
            $($modal).animate({
                'width': '0',
                'opacity': '0'
            }, 500, function () {
                $(this).css({
                    'width': '100%',
                    'display': 'none',
                    'opacity': '1'
                });
            })
        });
        $('.close').on('click', function () {
            $($modal).animate({
                'width': '0',
                'opacity': '0'
            }, 500, function () {
                $(this).css({
                    'width': '100%',
                    'display': 'none',
                    'opacity': '1'
                });
            });
        });
        var inNow = $('input[type=checkbox]');
        if (inNow.length == 1) {
            $('.select-all').prop({
                'checked': false
            });
            $('.mime').hide('ease');
            $(value).text('没了').addClass('warn');
        }
    });
    var inNow = $('input[type=checkbox]');
    if (inNow.length == 1) {
        $('.select-all').prop({
            'checked': false
        });
        $('.mime').hide('ease');
        $(value).text('没了').addClass('warn');
    }

    /* *
     * 删除项目弹窗操作
     * */
     $('.delete_item').on('click', function () {
         var $modal = $('.delete_project');
         var uid = $(this).attr('data-id');
         var todo_name = $(this).attr('data-name');

         $('.confirm_name').text('项目文件:' + todo_name);
         $($modal).slideDown(300, function () {
             $($content).animate({
                 'opacity': '1'
             }, 800);

         });
         $('.abort').on('click', function () {
             $.ajax({
                 type: 'post',
                 url: '/api/deleteProject',
                 data: {
                     id: todo_name
                 },
                 dataType: 'json',
                 success: function (data) {
                     console.log(data);
                 },
                 error: function () {
                     console.log('err:' + todo_name);
                 }
             });
             $($modal).animate({
                 'width': '0',
                 'opacity': '0'
             }, 500, function () {
                 $(this).css({
                     'width': '100%',
                     'display': 'none',
                     'opacity': '1'
                 });
             })
             window.location.reload();
         });
         $('.cancel').on('click', function () {
             $($modal).animate({
                 'width': '0',
                 'opacity': '0'
             }, 500, function () {
                 $(this).css({
                     'width': '100%',
                     'display': 'none',
                     'opacity': '1'
                 });
             })
         });
         $('.close').on('click', function () {
             $($modal).animate({
                 'width': '0',
                 'opacity': '0'
             }, 500, function () {
                 $(this).css({
                     'width': '100%',
                     'display': 'none',
                     'opacity': '1'
                 });
             });
         });
     })

})
