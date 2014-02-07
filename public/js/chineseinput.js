/*
  MIT Licence
  https://github.com/Codecademy/textarea-helper
  */
(function ($) {
  'use strict';

  var caretClass   = 'textarea-helper-caret'
    , dataKey      = 'textarea-helper'

    // Styles that could influence size of the mirrored element.
    , mirrorStyles = [ 
                       // Box Styles.
                       'box-sizing', 'height', 'width', 'padding-bottom'
                     , 'padding-left', 'padding-right', 'padding-top'
  
                       // Font stuff.
                     , 'font-family', 'font-size', 'font-style' 
                     , 'font-variant', 'font-weight'
  
                       // Spacing etc.
                     , 'word-spacing', 'letter-spacing', 'line-height'
                     , 'text-decoration', 'text-indent', 'text-transform' 
                     
                      // The direction.
                     , 'direction'
                     ];

  var TextareaHelper = function (elem) {
    if (elem.nodeName.toLowerCase() !== 'textarea' && elem.nodeName.toLowerCase() !== 'input') {
    	return;
    }
    this.$text = $(elem);
    this.$mirror = $('<div/>').css({ 'position'    : 'absolute'
                                   , 'overflow'    : 'auto'
                                   , 'white-space' : 'pre-wrap'
                                   , 'word-wrap'   : 'break-word'
                                   , 'top'         : 0
                                   , 'left'        : -9999
                                   }).insertAfter(this.$text);
  };

  (function () {
    this.update = function () {

      // Copy styles.
      var styles = {};
      for (var i = 0, style; style = mirrorStyles[i]; i++) {
        styles[style] = this.$text.css(style);
      }
      this.$mirror.css(styles).empty();
      
      // Update content and insert caret.
      var caretPos = this.getOriginalCaretPos()
        , str      = this.$text.val()
        , pre      = document.createTextNode(str.substring(0, caretPos))
        , post     = document.createTextNode(str.substring(caretPos))
        , $car     = $('<span/>').addClass(caretClass).css('position', 'absolute').html('&nbsp;');
      this.$mirror.append(pre, $car, post)
                  .scrollTop(this.$text.scrollTop());
    };

    this.destroy = function () {
      this.$mirror.remove();
      this.$text.removeData(dataKey);
      return null;
    };

    this.caretPos = function () {
      this.update();
      var $caret = this.$mirror.find('.' + caretClass)
        , pos    = $caret.position();
      if (this.$text.css('direction') === 'rtl') {
        pos.right = this.$mirror.innerWidth() - pos.left - $caret.width();
        pos.left = 'auto';
      }

      return pos;
    };

    this.height = function () {
      this.update();
      this.$mirror.css('height', '');
      return this.$mirror.height();
    };

    // XBrowser caret position
    // Adapted from http://stackoverflow.com/questions/263743/how-to-get-caret-position-in-textarea
    this.getOriginalCaretPos = function () {
      var text = this.$text[0];
      if (text.selectionStart) {
        return text.selectionStart;
      } else if (document.selection) {
        text.focus();
        var r = document.selection.createRange();
        if (r == null) {
          return 0;
        }
        var re = text.createTextRange()
          , rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);
        return rc.text.length;
      } 
      return 0;
    };

  }).call(TextareaHelper.prototype);
  
  $.fn.textareaHelper = function (method) {
    this.each(function () {
      var $this    = $(this)
        , instance = $this.data(dataKey);
      if (!instance) {
        instance = new TextareaHelper(this);
        $this.data(dataKey, instance);
      }
    });
    if (method) {
      var instance = this.first().data(dataKey);
      return instance[method]();
    } else {
      return this;
    }
  };

})(jQuery);

(function ($) {
    'use strict';

    $.chinesePinyinInput = function(el, conf) {
	    var self = this;
        self.$el = $(el);
        self.el = el;

        if (!conf || typeof conf !== 'object') {
			conf = {};
		}

		self.init = function() {
			self.conf = $.extend(true, {}, conf);
			self.active = true;

			self.pinyinInput = '';
			self.currentPage = 0;
			self.chosenCandidateIndex = 1;
			self.lastPage = false;
			self.hanzis = [];
			self.lens = [];
			self.wordpinyin = "";

			self.$el.keydown(self.keydownHandler);
			self.$el.keypress(self.keypressHandler);
			self.$el.data("pinyin", self);
		};

		self.addTxtAtCusor = function(text) {
			if (document.selection) {
				self.el.focus();
				var sel = document.selection.createRange();
				sel.text = text;
				self.el.focus();
			} else if (self.el.selectionStart || self.el.selectionStart == '0') {
				var start = self.el.selectionStart;
				var end = self.el.selectionEnd;
				var scroll = self.el.scrollTop;

				self.el.value = self.el.value.substring(0, start) + text
						+ self.el.value.substring(end, self.el.value.length);

				self.el.focus();
				self.el.selectionStart = start + text.length;
				self.el.selectionEnd = start + text.length;
				self.el.scrollTop = scroll;
			} else {
				self.el.value += text;
				self.el.focus();
		    }
		};

		self.checkPinyinInput = function() {
			return self.active === true;
		};

		self.setPinyinInput = function(open) {
			self.active = open === true;
		};

		self.hasPinyinInput = function() {
			return self.pinyinInput.length > 0;
		};

		self.keydownHandler = function(event) {
			if (!self.checkPinyinInput()) {
				return true;
			}
			if (self.hasPinyinInput()) {
				switch (event.which) {
				case $.ui.keyCode.LEFT:
					self.prevCandidate();
					return false;
				case $.ui.keyCode.RIGHT:
					self.nextCandidate();
					return false;
				case $.ui.keyCode.PAGE_UP:
					self.prevPage();
					return false;
				case $.ui.keyCode.PAGE_DOWN:
					self.nextPage();
					return false;
				case $.ui.keyCode.BACKSPACE:
					self.pinyinInput = self.pinyinInput.substring(0,
							self.pinyinInput.length - 1);
					self.refresh();
					event.preventDefault();
					return false;
				default:
					return true;
				}
			}
			return true;
		};

		self.keypressHandler = function(event) {
			if (!self.checkPinyinInput()) {
				return true;
			}

			if (/[a-zA-Z]/.test(String.fromCharCode(event.which))) {
				if (self.pinyinInput.length <= 20) {
					self.pinyinInput += String.fromCharCode(event.which);
				}
				self.refresh();
				event.preventDefault();
				return false;
			}

			if (self.hasPinyinInput()) {
				switch (event.which) {
				case $.ui.keyCode.SPACE:
					self.chooseCandidate(self.chosenCandidateIndex - 1);
					break;
				case 49:
					self.chooseCandidate(0);
					break;
				case 50:
					self.chooseCandidate(1);
					break;
				case 51:
					self.chooseCandidate(2);
					break;
				case 52:
					self.chooseCandidate(3);
					break;
				case 53:
					self.chooseCandidate(4);
					break;
				case $.ui.keyCode.ENTER:
					self.addTxtAtCusor(self.pinyinInput);
					self.pinyinInput = '';
					self.currentPage = 0;
					self.chosenCandidateIndex = 1;
					self.lastPage = false;
					break;
				}
				self.refresh();
				event.preventDefault();
				return false;
			}
			return true;
		};

		self.nextPage = function() {
			if (!self.lastPage) {
				self.currentPage += 1;
				self.refresh();
			}
		}

		self.prevPage = function() {
			if (self.currentPage > 0) {
				self.currentPage -= 1;
				self.lastPage = false;
				self.refresh();
			}
		}

		self.nextCandidate = function() {
			if (self.chosenCandidateIndex < 5) {
				self.chosenCandidateIndex += 1;
				self.refresh();
			} else {
				self.chosenCandidateIndex = 1;
				self.nextPage();
			}
		}

		self.prevCandidate = function() {
			if (self.chosenCandidateIndex > 1) {
				self.chosenCandidateIndex -= 1;
				self.refresh();
			} else if (self.currentPage > 0) {
				self.chosenCandidateIndex = 5;
				self.prevPage();
			}
		}

		self.chooseCandidate = function(selectionIndex) {
			var choices = self.hanzis;
			selectionIndex += self.currentPage * 5;
			if (selectionIndex < 0) {
				self.addTxtAtCusor(self.pinyinInput);
				self.pinyinInput = '';
				self.currentPage = 0;
				self.chosenCandidateIndex = 1;
				self.lastPage = false;
			}
			if (choices && selectionIndex < choices.length) {
				var choice = choices[selectionIndex];
				var len = self.lens[selectionIndex];
				self.addTxtAtCusor(choice);
				if (len && len > 0 && self.pinyinInput.length > len) {
					self.pinyinInput = self.pinyinInput.substring(len);
				} else {
					self.pinyinInput = "";
				}
				self.currentPage = 0;
				self.chosenCandidateIndex = 1;
				self.lastPage = false;
				self.hanzis = [];
				self.lens = [];
				self.wordpinyin = "";
			}

		};

		self.getPinyinBar = function() {
			var $box = $('#draggableCadidates');
			if (!$box.size()) {
				$box = $(document.createElement('div'))
						.draggable()
						.attr({
							'id' : 'draggableCadidates'
						})
						.html(
								'<span class="pinyin"></span><ul class="candidates"></ul>');
				$('body').append($box);
			}
			return $box;
		}

		self.refresh = function() {
			if (!self.hasPinyinInput()) {
				$('#draggableCadidates').hide();
				return;
			}
			var candidates = self.getCandidates();
			if (candidates && candidates.length) {
				var $box = self.getPinyinBar();
				$box.find('.pinyin').text(self.pinyinInput);
				var lis = [];
				for ( var i = 0; i < 5 && i < candidates.length; i++) {
					lis
							.push('<li '
									+ (i + 1 == self.chosenCandidateIndex ? 'class="current"'
											: '') + '> ' + (i + 1) + '. '
									+ candidates[i] + '</li>');
				}
				$box.find('ul').html(lis.join('\n'));
				$box.show();
				/*if (self.el.nodeName.toLowerCase() === 'textarea')*/ {
				var caretPosition = self.$el.textareaHelper('caretPos');
				$box.css({
					position : 'absolute',
					left : self.$el.offset().left + caretPosition.left,
					top : self.$el.offset().top + caretPosition.top
				});
				}/* else {
					$box.css({
						position : 'absolute',
						left : self.$el.offset().left ,
						top : self.$el.offset().top 
					});
				}*/
			} else {
				self.requestPinyinCandiates(self.pinyinInput, self.currentPage);
			}
		};

		self.getCandidates = function() {
			if (self.pinyinInput.length !== self.wordpinyin.length) {
				return false;
			}
			var candidates = self.hanzis;
			if (candidates && candidates.length >= (self.currentPage + 1) * 5) {
				return candidates.slice(self.currentPage * 5,
						(self.currentPage + 1) * 5);
			} else if (candidates
					&& candidates[candidates.length - 1] == self.pinyinInput) {
				self.lastPage = true;
				return candidates.slice(self.currentPage * 5);
			}
			return false;
		};

		self.requestPinyinCandiates = function(text, page) {
			var num = 10 + parseInt(Math.floor(page / 2)) * 10;
			$
					.get(
							'http://www.google.com/inputtools/request?ime=pinyin&ie=utf-8&oe=utf-8&app=translate&uv',
							{
								'text' : text,
								'num' : num
							}, function(data) {
								self.parseData(data);
							});
		};

		self.parseData = function(data) {
			if (typeof data === 'string') {
				data = JSON.parse(data);
			}
			var reply = data[1][0];
			self.wordpinyin = reply[0];
			var hanzis = reply[1];
			self.lens = reply[2];
			if (typeof self.lens == 'undefined') {
				self.lens = new Array(hanzis.length);
				for ( var i = 0; i < self.lens.length; i++) {
					self.lens[i] = self.wordpinyin.length;
				}
			}
			self.hanzis = hanzis;
			self.refresh();
		};

		self.init();
	};

	$.fn.chinesePinyinInput = function(conf) {
		return this.each(function() {
			(new $.chinesePinyinInput(this, conf));
		});
	};
})(jQuery);
