+(function($, window, undefined){
  
  'use strict';

  // CLASS DEFINITION
  // ================
  var Accordion = function(el, o){
    this.$el = $(el);
    this.o = o;
    this.$items = this.$el.find(o.itemSlt);
    this._bindEvents();
  }

  Accordion.VERSION  = '0.0.1';

  Accordion.prototype.toggle = function($this){
    var $acBody = $this.next(this.o.itemBodySlt), 
        activeCls = this.o.activeCls,
        $oldActive = this.$el.find(this.o.itemSlt+activeCls),
        i = $this.index();
    if(!$acBody.length) return;

    if(this.o.showSingle && $oldActive.index()>-1 && $oldActive.index() != i){
     $oldActive.trigger('click');
    }

    var aCls = activeCls.substring(1);

    $this.toggleClass(aCls);
    if($this.hasClass(aCls)){
      $acBody.css('height', 'auto');
      this.o.onShown && this.o.onShown.call(this);
    }else{
      $acBody.css('height','0');
    }
  };

  Accordion.prototype._bindEvents = function(){
    var _this = this;
    this.$items.on('click.accordion.ui', function(){ _this.toggle.call(_this, $(this)); });
    (this.o.activeIndex > -1)  && this.$items.eq(this.o.activeIndex).trigger('click');
  };

  Accordion.prototype.destroy = function(){
    this.$el.data('ui.accordion','').off('click.accordion.ui');
  };

  // PLUGIN DEFINITION
  // =================
  function Plugin(option) {
    return this.each(function() {
      var $this = $(this);
      var data = $this.data('ui.accordion');
      var options = $.extend({}, $.fn.accordion.defaults, typeof option == 'object' && option);

      if (!data) {
        $this.data('ui.accordion', (data = new Accordion(this, options)));
      }else if(typeof data === 'string'){
        data[option] && data[option].call(data);
      }
    });
  }

  var old = $.fn.accordion;

  $.fn.accordion = Plugin;

  $.fn.accordion.defaults = {
    itemSlt: '.weui_cell',
    itemBodySlt: '.weui_accordion_body',
    activeCls: '.active',
    showSingle: true,	//是否只显示一个
    onShown: null, 		//callback: function(this){}
    activeIndex: -1,  //默认显示的项 -1不显示
  };
  
  $.fn.accordion.Constructor = Accordion;

  // NO CONFLICT
  // ===========
  $.fn.accordion.noConflict = function () {
    $.fn.accordion = old;
    return this;
  }

  // DATA-API
  // ========
  $(function(){
    var $target = $('[data-ui-accordion]');
    $target.accordion();
  });

})(Zepto, window, undefined);