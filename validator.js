// 待完善：内置规则
// 自动验证 添加 validator-validate
// required
// integer
// match
// range
// length
// checked
// remote
// 约定大于配置！！！

!(function($, window, undefined){
    var INPUT_SELECTOR = '[data-rule]', 
        ACTIVE_CLS = '.v-validate';

    var RULES={
        digits: [/^\d+$/, "请输入数字"],
        letters: [/^[a-z]+$/i, "请输入字母"],
        date: [/^\d{4}-\d{2}-\d{2}$/, "请输入有效的日期，格式:yyyy-mm-dd"],
        email:[/^[\w\+\-]+(\.[\w\+\-]+)*@[a-z\d\-]+(\.[a-z\d\-]+)*\.([a-z]{2,4})$/i, '请输入有效的邮箱'],
        url: [/^(https?|s?ftp):\/\/\S+$/i, "请输入有效的网址"],
        qq: [/^[1-9]\d{4,}$/,"请输入有效的QQ号"],
        IDcard: [/^\d{6}(19|2\d)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)?$/, "请输入正确的身份证号码"],
        mobile: [/^1[3-9]\d{9}$/, "请输入有效的手机号"],
        zipcode: [/^\d{6}$/, "请检查邮政编码格式"],
        chinese: [/^[Α-￥]+$/, "请输入中文字符"],
        username: [/^\w{3,12}$/, "请输入3-12位数字、字母、下划线"],
        password: [/^[\S]{6,16}$/, "请输入6-16位字符，不能包含空格"],
        required: function(element) {
            return !!$.trim(element.value);
        },
        integer: function(element, params) {
          /** 整数
           *  integer
           *  integer[+]
           *  integer[+0]
           *  integer[-]
           *  integer[-0]
           */
          var re, z = '0|',
              p = '[1-9]\\d*',
              key = params ? params[0] : '*';
          switch (key) {
              case '+':
                  re = p;
                  break;
              case '-':
                  re = '-' + p;
                  break;
              case '+0':
                  re = z + p;
                  break;
              case '-0':
                  re = z + '-' + p;
                  break;
              default:
                  re = z + '-?' + p;
          }
          re = '^(?:' + re + ')$';
          return new RegExp(re).test(element.value);
        },
        match: function(element, params) {
          /** 是否匹配另一个字段
         *  match[password]    匹配password字段 (两字段的值必须相同)
         *  match[lt, count]   值必须小于count字段的值
         *  match[lte, count]  值必须小于或等于count字段的值
         *  match[gt, count]   值必须大于count字段的值
         *  match[gte, count]  值必须大于或等于count字段的值
         **/

          var a = element.value,
              b,
              key, msg, type = 'eq',
              el2, field2;

          if (!params) return;
          if (params.length === 1) {
              key = params[0];
          } else {
              type = params[0];
              key = params[1];
          }
          el2 = $(key.charAt(0) === '#' ? key : ':input[name="' + key + '"]', this.$el)[0];
          if (!el2) return;
          field2 = this.getField(el2);
          b = el2.value;
          switch (type) {
              case 'lt':
                  return (+a < +b);
              case 'lte':
                  return (+a <= +b);
              case 'gte':
                  return (+a >= +b);
              case 'gt':
                  return (+a > +b);
              default:
                  return (a === b);
          }
          return false;
        },
        range: function(element, params) {
          /** 数值范围
           *  range[0~99]    0-99的数
           *  range[0~]      大于0的数
           *  range[~100]    于100的数
           **/
          return getRangeRes(+element.value, params, 'range');
        },
        checked: function(element, params) {
          /** 针对checkbox选中的数目, 以及checkbox、radio是否有选中
           *  checked;       不能为空，相当于required
           *  checked[1~3]   选择1-3项
           *  checked[1~]    选择大于1项
           *  checked[~3]    选择少于3项
           *  checked[3]     选择3项
           **/

          if (!$(element).is(':radio,:checkbox')) return true;
          var count = $('input[name="' + element.name + '"]', this.$el).filter(function() {
              return !this.disabled && this.checked && $(this).is(':visible');
          }).length;
          if (!params) {
              return !!count;
          } else {
              return getRangeRes(count, params, 'checked');
          }
        },
        length: function(element, params) {
          /** 验证长度 (可以传第二个参数"true", 将会计算字节长度)
           *  length[6~16]    6-16个字符
           *  length[6~]      大于6个字符
           *  length[~16]     小于16个字符
           *  length[~16, true]     小于16个字符, 非ASCII字符计算双字符
           **/
          var value = element.value,
              len = (params[1] ? value.replace(rDoubleBytes, 'xx') : value).length;
          if (params && params[0].charAt(0) === '~') params[0] = '0' + params[0];
          return getRangeRes(len, params, 'length', (params[1] ? '2_' : ''));
        },
        filter: function(element, params) {
          /** 过滤器，直接过滤不提示错误(支持自定义正则)
           *  filter          过滤<>
           *  filter(regexp)  过滤正则匹配的字符
           */
          var reg = params ? (new RegExp("[" + params[0] + "]", "g")) : rUnsafe;
          element.value = element.value.replace(reg, '');
          return true;
        }
    };

    // 工具方法
    function getRangeRes(value, params, type, suffix) {
      if (!params) return;

      var me = this,
          p = params[0].split('~'),
          a = p[0],
          b = p[1],
          c = 'rg',
          args = [''],
          isNumber = +value === +value;

      if (p.length === 2) {
          if (a && b) {
              if (isNumber && value >= +a && value <= +b) return true;
              args = args.concat(p);
          } else if (a && !b) {
              if (isNumber && value >= +a) return true;
              args.push(a);
              c = 'gte';
          } else if (!a && b) {
              if (isNumber && value <= +b) return true;
              args.push(b);
              c = 'lte';
          }
      } else {
          if (value === +a) return true;
          args.push(a);
          c = 'eq';
      }

      return false;
    }
    function getRule(data, rName){
      var t = rName.slice(0,1).toUpperCase()+rName.slice(1);
      var msg = data['msg'+t];
      var rule = data['rule'+t];

      var m  = msg ? msg : '数据不能为空或格式不正确';
      var rule = rule ? eval(rule) : RULES[rName];

      var r;
      if($.type(rule) == 'array'){
        r = rule[0]; 
        m = msg || rule[1];
      }else{
        r = rule;
      }

      return { rule: r, msg: m };
    }
    function getRuleFn(rule){
     switch ($.type(rule)) {
        case 'function':
            return rule;
        case 'array':
          return function(el) {
              return rule[0].test(el.value);
          };
        case 'regexp':
            return function(el) {
                return rule.test(el.value);
            };
      }
      return false;
    }      
 
    var Validator = function(el, opt){
      this.$form = $(el);
      this.o = opt;
      this.fieldData = [];

      this.init();
    };

    Validator.prototype = {
      constructor:Validator,
      init:function(){
        this.bindEvents();
      },
      validate:function(){
        var _this = this;
        this.getFields();
        if(!this.fieldData.length) return;
        
        var fields = this.fieldData, rules, $obj, data;

        // 逐个字段验证
        for(var i in fields){
            $obj = fields[i].obj;
            data = fields[i].data;
            ruleNames = fields[i].data.rule.split(';')
                      .map(function(v){ return v.trim(); })
                      .filter(function(v){ return v !== ''});
            
            // 逐个规则验证
            for(var j in ruleNames){
                var rName=ruleNames[j], pms='';
 
                if(rName.indexOf('[')>-1){
                    var t = rName.split('[');
                    rName = t[0];
                    pms = t[1].substring(0,t[1].length-1).split(',');
                }else{
                    pms='';
                }
                
                var ruleInfo = getRule(data, rName);

                if(!getRuleFn(ruleInfo.rule)($obj[0], pms)){
                  $obj.focus();
                  $obj.closest('.weui_cell').addClass("weui_cell_warn");
                  $.notification(ruleInfo.msg);
                  this.invalid && this.invalid($obj);
                  return false;
                }

                $obj.closest('.weui_cell').removeClass("weui_cell_warn");
            }
        }

        var formData = {};
        this.$form.serializeArray().forEach(function(v){
          formData[v.name] = $.trim(o.value);
        })

        this.o.valid && this.o.valid(formData)
        return true;
      },
      validField:function(){
      },
      getFields:function(){
        var _this = this, name;
        _this.fieldData.length=0;
        this.$form.find('[data-rule]').each(function(){
          fName = this.name;
          _this.fieldData.push({name:fName, data:this.dataset, obj:$(this)});
        });
      },
      bindEvents:function(){
        this.$form
          .on('submit', this._submit.bind(this))
          .on('reset', this._reset.bind(this))
          .on('focusin', INPUT_SELECTOR, this._focusin.bind(this))
          .on('focusout', INPUT_SELECTOR, this._focusout.bind(this))
          .on('keydown', INPUT_SELECTOR, this._keydown)
          .on('click', ACTIVE_CLS, this.validate.bind(this))
          .attr('novalidate','true');
      },
      _submit:function(e){
        e.preventDefautl();
        var o = {};
        if(this.validate()){
          this.$form.serializeArray().forEach(function(v){
            o[v.name] = $.trim(o.value);
          })
        }
        return o;
      },
      _reset:function(){
        this.$form[0].reset();
      },
      _focusin:function(){
        this.$form.find('.weui_cell_warn').removeClass("weui_cell_warn");
      },
      _focusout:function(){
        // console.log('focusout');//是否需要失去焦点验证，看以后的需求
      },
      _keydown:function(){
        $(this).closest('.weui_cell_warn').removeClass('weui_cell_warn');
      }
    }

    var Plugin = function(option){
      return this.each(function(){
        var $this = $(this);
        var data = $this.data('ui.validator');
        var options = $.extend({}, $.fn.validator.defaults, typeof option == 'object' && option);

        if (!data) {
          $this.data('ui.validator', (data = new Validator(this, options)));
        }
        if(typeof option === 'string'){
          data[option] && data[option].call(data);
        }
      });
    }

    var old = $.fn.validator;

    $.fn.validator = Plugin;

    $.fn.validator.defaults = {
      valid: null,
      invalid: null,
      // validOnFocusout: true,
    };

    $.fn.validator.noConflict = function(){
      $.fn.validator = old;
      return this;
    }

})(Zepto, window, undefined);