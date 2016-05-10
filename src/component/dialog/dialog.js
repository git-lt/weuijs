+function ($) {
    "use strict";
    var _modalTemplateTempDiv = document.createElement('div');

    $.modalStack = [];
    $.queueOffcanvas = [];
    $.dequeueOffcanvas = function(){
        return ($.queueOffcanvas.shift())();
    }

    $.modalStackClearQueue = function () {
        if ($.modalStack.length) {
            ($.modalStack.shift())();
        }
    };
    $.modal = function (params) {
        params = params || {};
        var modalHTML = '';
        var buttonsHTML = '';
        var useCss3 = typeof params.useCss3 !== 'undefined' ? params.useCss3 : defaults.useCss3;

        if (params.buttons && params.buttons.length > 0) {
            for (var i = 0; i < params.buttons.length; i++) {
                buttonsHTML += '<a class="weui_btn_dialog' + (params.buttons[i].close ? ' default' : '') + '">' + params.buttons[i].text + '</a>';
            }
        }
        var extraClass = params.extraClass || '';
        var titleHTML = '<div class="weui_dialog_hd"><strong class="weui_dialog_title">' + (params.title?params.title:'提示') + '</strong></div>';
        var textHTML = params.text ? '<div class="weui_dialog_bd">' + params.text + '</div>' : '';
        var afterTextHTML = params.afterText ? params.afterText : '';
        var noButtons = !params.buttons || params.buttons.length === 0 ? 'modal-no-buttons' : '';
        var verticalButtons = params.verticalButtons ? 'modal-buttons-vertical' : '';
        modalHTML = '<div class="weui_dialog weui_dialog_'+params.type+'"><div class="weui_dialog_inner ' + extraClass + ' ' + noButtons + ' '+params.type+'">' + (titleHTML + textHTML + afterTextHTML) + '<div class="weui_dialog_ft ' + verticalButtons + '">' + buttonsHTML + '</div></div></div>';

        _modalTemplateTempDiv.innerHTML = modalHTML;

        var modal = $(_modalTemplateTempDiv).children();
        $(defaults.modalContainer).append(modal[0]);

        modal.find('.weui_dialog_ft .weui_btn_dialog').each(function (index, el) {
            $(el).on('click', function (e) {
                if (params.buttons[index].close !== false) $.closeModal(modal, useCss3);
                if (params.buttons[index].onClick) params.buttons[index].onClick(modal, e);
                if (params.onClick) params.onClick(modal, index);
            });
        });
        $.openModal(modal, useCss3);
        return modal[0];
    };
    $.alert = function (text, title, callbackOk) {
        if (typeof title === 'function') {
            callbackOk = arguments[1];
            title = undefined;
        }
        return $.modal({
            useCss3:false,
            type:'alert',
            text: text || '',
            title: typeof title === 'undefined' ? defaults.modalTitle : title,
            buttons: [ {text: defaults.modalButtonOk, onClick: callbackOk} ]
        });
    };
    $.confirm = function (text, title, callbackOk, callbackCancel) {
        if (typeof title === 'function') {
            callbackCancel = arguments[2];
            callbackOk = arguments[1];
            title = undefined;
        }
        return $.modal({
            useCss3:false,
            type:'confirm',
            text: text || '',
            title: typeof title === 'undefined' ? defaults.modalTitle : title,
            buttons: [
                {text: defaults.modalButtonCancel, onClick: callbackCancel, close: true},
                {text: defaults.modalButtonOk, onClick: callbackOk}
            ]
        });
    };
                    
    $.prompt = function (title, callbackOk, callbackCancel) {
        if (typeof title === 'function') {
            callbackCancel = arguments[2];
            callbackOk = arguments[1];
            title = undefined;
        }

        return $.modal({
            useCss3:false,
            type:'prompt',
            title: typeof title === 'undefined' ? defaults.modalTitle : title,
            afterText: '<div class="weui_cells weui_cells_form">\
                <div class="weui_cell">\
                    <div class="weui_cell_bd weui_cell_primary">\
                        <textarea class="weui_textarea ipt-result" placeholder="请输入" rows="3"></textarea>\
                    </div>\
                </div>\
            </div>',
            buttons: [
                {
                    text: defaults.modalButtonCancel,
                    close: true
                },
                {
                    text: defaults.modalButtonOk,
                }
            ],
            onClick: function (modal, index) {
                if (index === 0 && callbackCancel) callbackCancel($(modal).find('.ipt-result').val());
                if (index === 1 && callbackOk) callbackOk($(modal).find('.ipt-result').val());
            }
        });
    };
    $.loading = function (text) {
        if ($('.weui_loading_toast')[0]) { return $('.weui_loading_toast').remove();};

        var l = [];
        l.push('<div class="weui_loading_toast"><div class="weui_mask_transparent"></div>');
        l.push('<div class="weui_toast"><div class="weui_loading">');
        for(var i=0; i<=11; i++){
            l.push('<div class="weui_loading_leaf weui_loading_leaf_'+i+'"></div>');
        }
        l.push('</div>');
        l.push('<p class="weui_toast_content">'+(text?text:'数据加载中')+'</p>');
        l.push('</div></div>');
        $(defaults.modalContainer).append(l.join(''));
    };
    $.actions = function (params) {
        var modal, groupSelector, buttonSelector;
        params = params || [];

        if (params.length > 0 && !$.isArray(params[0])) {
            params = [params];
        }

        var modalHTML;
        var buttonsHTML = '';
        for (var i = 0; i < params.length; i++) {
            for (var j = 0; j < params[i].length; j++) {
                if (j === 0) buttonsHTML += '<div class="weui_actionsheet_menu">';
                var button = params[i][j];
                var buttonClass = button.label ? 'weui_actionsheet_cell label' : 'weui_actionsheet_cell';
                if (button.bold) buttonClass += ' actions-modal-button-bold';
                if (button.color) buttonClass += ' color-' + button.color;
                if (button.bg) buttonClass += ' bg-' + button.bg;
                if (button.disabled) buttonClass += ' disabled';
                buttonsHTML += '<div class="' + buttonClass + '">' + button.text + '</div>';
                if (j === params[i].length - 1) buttonsHTML += '</div>';
            }
        }
        modalHTML = '<div class="weui_actionsheet">' + buttonsHTML + '</div>';
        _modalTemplateTempDiv.innerHTML = modalHTML;
        modal = $(_modalTemplateTempDiv).children();
        $(defaults.modalContainer).append(modal[0]);
        groupSelector = '.weui_actionsheet_menu';
        buttonSelector = '.weui_actionsheet_cell';

        var groups = modal.find(groupSelector);
        groups.each(function (index, el) {
            var groupIndex = index;
            $(el).children().each(function (index, el) {
                var buttonIndex = index;
                var buttonParams = params[groupIndex][buttonIndex];
                var clickTarget;
                if ($(el).is(buttonSelector)) clickTarget = $(el);
                if (clickTarget) {
                    clickTarget.on('click', function (e) {
                        if (buttonParams.close !== false) $.closeModal(modal, defaults.useCss3);
                        if (buttonParams.onClick) buttonParams.onClick(modal, e);
                    });
                }
            });
        });
        $.openModal(modal, defaults.useCss3);
        return modal[0];
    };
    $.popup = function (modal) {
        if (typeof modal === 'string' && modal.indexOf('<') >= 0) {
            var _modal = document.createElement('div');
            _modal.innerHTML = modal.trim();
            if (_modal.childNodes.length > 0) {
                modal = _modal.childNodes[0];
                $(defaults.modalContainer).append(modal);
            }
            else return false; 
        }
        modal = $(modal);
        if (modal.length === 0) return false;
        !$(modal).hasClass('popup') && $(modal).addClass('popup');
        modal.show();
        $.openModal(modal, defaults.useCss3);

        return modal[0];
    };
    $.toast = function(msg, icon, duration) {
        var toastStr = [];
        toastStr.push('<div class="toast"><div class="weui_mask_transparent"></div>');
        if(icon && icon.length){
            toastStr.push('<div class="weui_toast"><div class="weui_toast_icon">'+icon+'</div>');
            toastStr.push('<p class="weui_toast_content">'+msg+'</p></div></div>');
        }else{
            toastStr.push('<div class="weui_toast onlytxt">' + msg + '</div></div>');
        }

        var $toast = $(toastStr.join('')).appendTo(document.body);
        $toast.one('opened', function(){
            setTimeout(function() {
                $.closeModal($toast, true);
            }, duration || 2000);
        });
        $.openModal($toast, true);
    };
    $.offcanvas=function(conHtml, position, onOpenedFn){
        var o = {
            useCss3:true,
            content: '',
            position:position || 'top', //left,right,bottom,top
            contentStyle:null, // {top:'20px',color:'red'}
            onOpenBefore:null,
            onOpenAfter:typeof onOpenedFn == 'function' ? onOpenedFn : null,
            onCloseBefore:null,
            onCloseAfter:null,
        }

        if(typeof conHtml === 'object'){
            o = $.extend({}, o , conHtml);
        }else{
            o.content = conHtml;
        }

        var modal = o.content;
        if (typeof modal === 'string' && modal.indexOf('<') >= 0) {
            var _modal = document.createElement('div');
            _modal.innerHTML = modal.trim();
            if (_modal.childNodes.length > 0) {
                modal = _modal.childNodes[0];
                $(defaults.modalContainer).append(modal);
            }
            else return false; 
        }
        var $modal =$(modal);
        !$modal.hasClass('weui_offcanvas') && $modal.addClass('weui_offcanvas');
        if(typeof o.onOpenBefore == 'function') $modal.one('open', function(){ o.onOpenBefore.call(this, $modal)});
        if(typeof o.onOpenAfter == 'function') $modal.one('opened', function(){ o.onOpenAfter.call(this, $modal)});
        if(typeof o.onCloseBefore == 'function') $modal.one('close', function(){ o.onCloseBefore.call(this, $modal)});
        if(typeof o.onCloseAfter == 'function') $modal.one('closed', function(){ o.onCloseafter.call(this, $modal)});
        return $.openModal(modal, o.useCss3, o)
    }
    $.openModal = function (modal, useCss3, opt) {
        modal = $(modal);
        var isModal = modal.hasClass('modal'),
            isNotToast = !modal.hasClass('toast'),
            isOffcanvas = !!opt,
            isPopup = modal.hasClass('popup'),
            isToast = modal.hasClass('toast');

        if ($('.modal.modal_in:not(.modal_out)').length && defaults.modalStack && isModal && isNotToast) {
            $.modalStack.push(function () {
                $.openModal(modal, useCss3);
            });
            return;
        }

        if($('.weui_offcanvas.modal_in:not(.modal_out)').length && defaults.modalStack && isOffcanvas){
            var oldModal = $('.weui_offcanvas.modal_in');
            $.queueOffcanvas.push(function () {
                $.openModal(modal, useCss3, opt);
            });
            $.closeModal(oldModal, useCss3);
            return;
        }
        
        if (isModal) {
            modal.show();
            modal.css({
                marginTop: - Math.round(modal.outerHeight() / 2) + 'px'
            });
        }
        if (isToast) {
            modal.css({
                marginLeft: - Math.round(modal.outerWidth() / 2 / 1.185) + 'px' //1.185 是初始化时候的放大效果
            });
        }
        if (isOffcanvas){
            if(opt.position) modal.addClass(opt.position);
            if(opt.contentStyle) modal.css(opt.contentStyle);
            modal.show();
        }

        var overlay;
        if (!isToast) {
            if ($('.weui_mask').length === 0 && !isPopup && !isOffcanvas) {
                $(defaults.modalContainer).append('<div class="weui_mask"></div>');
            }
            if ($('.popup_overlay').length === 0 && (isPopup || isOffcanvas)) {
                $(defaults.modalContainer).append('<div class="popup_overlay"></div>');
            }
            overlay = (isPopup || isOffcanvas) ? $('.popup_overlay') : $('.weui_mask');
        }

        //trigger relayout;
        var clientLeft = modal[0].clientLeft;
        modal.trigger('open');

        // Classes for transition in
        if (!isToast) overlay.addClass('weui_mask_visible');
        modal.removeClass('modal_out').addClass('modal_in').transitionEnd(function (e) {
            if (modal.hasClass('modal_out')) modal.trigger('closed');
            else modal.trigger('opened');
        }, useCss3);
        
        // excute callback
        if (typeof cb === 'function') {
          cb.call(this, modal);
        }
        return true;
    };
    $.closeModal = function (modal, useCss3) {
        modal = $(modal || '.weui_dialog');
        if (typeof modal !== 'undefined' && modal.length === 0) {
            return;
        }
        var isModal = modal.hasClass('weui_dialog'),
            isPopup = modal.hasClass('popup'),
            isToast = modal.hasClass('toast'),
            isOffcanvas = modal.hasClass('weui_offcanvas'),
            overlay = (isPopup || isOffcanvas) ? $('.popup_overlay') : $('.weui_mask');
        
        if(isOffcanvas){
            !$.queueOffcanvas.length && overlay.removeClass('weui_mask_visible');
        }else if (isPopup){
            if (modal.length === $('.popup.modal_in').length) {
                overlay.removeClass('weui_mask_visible');
            }
        }
        else if (!isToast) {
            overlay.removeClass('weui_mask_visible');
        }

        modal.trigger('close');
        modal.removeClass('modal_in').addClass('modal_out').transitionEnd(function (e) {
            if (modal.hasClass('modal_out')) modal.trigger('closed');
            else modal.trigger('opened');

            if (isPopup || isOffcanvas) {
                modal.removeClass('modal_out').hide();
                if (modal.length > 0) {
                    modal.remove();
                }
            }
            else {
                modal.remove();
            }

            if(isOffcanvas && $.queueOffcanvas.length){
                $.dequeueOffcanvas();
            }
        }, useCss3);

        if (isModal &&  defaults.modalStack ) {
            $.modalStackClearQueue();
        }

        return true;
    };
    function handleClicks(e) {
        var clicked = $(this);
        var url = clicked.attr('href');

        var clickedData = clicked.dataset();

        var popup;
        if (clicked.hasClass('open-popup')) {
            if (clickedData.popup) {
                popup = clickedData.popup;
            }
            else popup = '.popup';
            $.popup(popup);
        }
        if (clicked.hasClass('close-popup')) {
            if (clickedData.popup) {
                popup = clickedData.popup;
            }
            else popup = '.popup.modal_in';
            $.closeModal(popup, defaults.useCss3);
        }
        if (clicked.hasClass('close-offcanvas')) {
            $.closeModal('.weui_offcanvas.modal_in', defaults.useCss3);
        }

        //点击mask层关闭
        if (clicked.hasClass('weui_mask')) {
            if ($('.modal.modal_in').length > 0 && defaults.modalCloseByOutside)
                $.closeModal('.modal.modal_in', defaults.useCss3);
            if ($('.weui_actionsheet.modal_in').length > 0 && defaults.actionsCloseByMask)
                $.closeModal('.weui_actionsheet.modal_in', defaults.useCss3);
        }
        if (clicked.hasClass('popup_overlay')) {
            if ($('.popup.modal_in').length > 0)
                $.closeModal('.popup.modal_in', defaults.useCss3);
            if ($('.weui_offcanvas.modal_in').length > 0 && defaults.offcanvasCloseByMask)
                $.closeModal('.weui_offcanvas.modal_in', defaults.useCss3);
        }
    }
    $(document).on('click', '.weui_mask, .popup_overlay, .close-popup, .open-popup, .close-offcanvas', handleClicks);
    var defaults =  $.modal.prototype.defaults  = {
        useCss3:true,
        modalStack: true,
        modalCloseByOutside:false,
        actionsCloseByMask:true,
        offcanvasCloseByMask:true,
        modalButtonOk: '确定',
        modalButtonCancel: '取消',
        modalPreloaderTitle: '加载中',
        modalContainer : document.body ? document.body : 'body'
    };
}(Zepto);