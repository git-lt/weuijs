/*选项卡tab切换组件，用法： 
* new WTab({
*    hasBorder: true,
*    skinClass: '',
*    navId: 'tabNav',
*    contentId: 'tabContent',
*    navActiveClass: '',
*    callback: function(){}
*});
*/
!(function(window, $, undefined){
    var WTab = function(options){
        var _this = this;
        this.data = {
            hasBorder: false,
            skinClass: '',
            navId: '',
            contentId: '',
            navActiveClass: 'weui_bar_item_on',
            callBack: new Function()
        }
        this.data = $.extend(this.data,options);
        this.data.W = 100/$("#" + this.data.navId).children().length;

        this.init(this.data.hasBorder);
        this.data.callBack&&this.data.callBack();
    }

    WTab.VERSION = '0.0.1';

    WTab.prototype = {
        init: function(hasBorder){
            var _this = this;
            if (hasBorder) {
                $("#" + this.data.navId).append("<div class='wtab-ink' style='width:" + _this.data.W + "%'></div>");
            }
            $("#" + this.data.navId).on("click", "#" + this.data.navId +　">div", function(){
                var i = $(this).index();
                _this.jump(i, hasBorder);
            });
        },
        jump: function(i, hasBorder){
            if (hasBorder){
                $(".wtab-ink").css("-webkit-transform", "translateX(" + i*100 + "%)");
            }
            $("#" + this.data.navId + ">div:eq(" + i + ")").addClass(this.data.navActiveClass).siblings().removeClass(this.data.navActiveClass);
            $("#" + this.data.contentId + ">div:eq(" + i + ")").addClass("on").siblings().removeClass("on");
        }
    }

    $.tab = function(options){
        return  new WTab(options);
    }
})(window, Zepto, undefined);
