!(function($, window, undefined){

  'use strict';

  // CLASS DEFINITION
  // ================
  var Notification = function(opt){
    this.timmer = null;
    this.$el = null;
    this.o = opt;
    this.init();
  }
  
  Notification.VERSION = '0.0.1';

  Notification.prototype = {
    constructor:Notification,
    init:function(){
      var o = this.o;
      this.$el = $('<div class="'+o.wrapCls+' weui_'+o.type+'">'+o.msg+(o.hasCloseBtn?'<span class="weui_notification_close"><i class="weui_icon_cancel"></i></span>':'')+'</div>').appendTo('body').show();
      var h = '-'+this.$el.getRealSize().height+'px';
      this.$el.css('top', h);

      this.show.call(this);
      o.hasCloseBtn && this.bindEvents.call(this, this.$el);
    },
    show: function(){
      var $el = this.$el, 
          _this = this, 
          o = this.o;

      setTimeout(function(){
        $el.css({top:0, opacity:1}); 
        (typeof o.onOpened === 'function') && o.onOpened();
      }, 200);

      _this.timmer = setTimeout(function(){
        _this.hide.call(_this);
      }, o.duration)
    },
    bindEvents:function($el){
      var _this = this;
      $el.one('click','.weui_notification_close', function(){
        _this.hide.call(_this);
      })
    },
    hide: function(){
      var _this = this, o = _this.o;
      this.$el.css({opacity:0});
      this.$el.transitionEnd(function(){
        _this.destroy.call(_this);
        (typeof o.onClosed === 'function') && o.onClosed();
      });
    },
    destroy:function(){ 
      this.$el.remove();
      this.$el = null;
    }
  }

  // PLUGIN DEFINITION
  // =================
  var Plugin = function(msg, openedFn, closedFn, duration){
    var opt;

    if(typeof msg === 'object'){
      opt = $.extend({}, $.notification.defaults, msg);
    }else if(typeof msg === 'string'){
      opt = {
        msg: msg || '',
        onOpened: openedFn || $.noop,
        onClosed: openedFn || $.noop,
        duration: duration || 3000
      };
      opt = $.extend({},$.notification.defaults, msg, opt);
    }

    if(!$('.'+opt.wrapCls).length){
      return new Notification(opt);
    }
  };

  var old = $.notification;

  $.notification = Plugin;

  $.notification.defaults = {
    msg: '',
    wrapCls: 'weui_toptips',
    type: 'warn', //warn
    duration: '3000',
    hasCloseBtn: false,
    onOpened: null, // 显示后的回调
    onClosed: null  //关闭后的回调
  };
  
  // NO CONFLICT
  // ===========
  $.notification.noConflict = function () {
    $.notification = old;
    return this;
  }

})(Zepto, window, undefined);