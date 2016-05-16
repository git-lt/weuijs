(function ($) {
    $.fn.searchBar = function (options) {
        options = $.extend({
            focusingClass: 'weui_search_focusing',
            searchText: "搜索",
            cancelText: "取消"
        }, options);

        var html = "<div class=\"weui_search_bar\">\n                    <form class=\"weui_search_outer\">\n                        <div class=\"weui_search_inner\">\n                            <i class=\"weui_icon_search\"></i>\n                            <input type=\"search\" class=\"weui_search_input\" id=\"weui_search_input\" placeholder=\"" + options.searchText + "\" required/>\n                            <a href=\"javascript:\" class=\"weui_icon_clear\"></a>\n                        </div>\n                        <label for=\"weui_search_input\" class=\"weui_search_text\">\n                            <i class=\"weui_icon_search\"></i>\n                            <span>" + options.searchText + "</span>\n                        </label>\n                    </form>\n                    <a href=\"javascript:\" class=\"weui_search_cancel\">" + options.cancelText + "</a>\n                </div>";

        var $search = $(html);
        this.append($search);

        var $searchBar = this.find('.weui_search_bar');
        var $searchText = this.find('.weui_search_text');
        var $searchInput = this.find('.weui_search_input');

        this.on('focus', '#weui_search_input', function () {
            $searchText.hide();
            $searchBar.addClass(options.focusingClass);
            bindEvent($searchInput, 'onfocus', options);
        }).on('blur', '#weui_search_input', function () {
            $searchBar.removeClass(options.focusingClass);
            !!$(this).val() ? $searchText.hide() : $searchText.show();
            bindEvent($searchInput, 'onblur', options);
        }).on('touchend', '.weui_search_cancel', function () {
            $searchInput.val('');
            bindEvent($searchInput, 'oncancel', options);
        }).on('touchend', '.weui_icon_clear', function (e) {
            //阻止默认动作
            e.preventDefault();
            $searchInput.val('');
            if (document.activeElement.id != 'search_input') {
                $searchInput.trigger('focus');
            }
            bindEvent($searchInput, 'onclear', options);
        }).on('input', '.weui_search_input', function () {
            bindEvent($searchInput, 'input', options);
        }).on('submit', '.weui_search_outer', function () {
            if (typeof options.onsubmit == 'function') {
                bindEvent($searchInput, 'onsubmit', options);
                return false;
            }
        });

        function bindEvent(target, event, options) {
            if (typeof options[event] == 'function') {
                var value = $(target).val();
                options[event].call(target, value);
            }
        }
    };
})($);