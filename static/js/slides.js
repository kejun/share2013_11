;(function() {

var language = {
  css:   'css',
  js:    'javascript',
  html:  'markup',
  svg:   'markup'
}; 

var htmlEncode = function(str) {
  return str.replace(/\&/g, '&amp;')
            .replace(/\</g, '&lt;')
            .replace(/\>/g, '&gt;');
};

$.each($('pre[data-src]'), function() {
  var pre = $(this);
  $.ajax({
    url: pre.data('src'),
    success: function(e) {
      if (!e) {
        return;
      }
      var code = $('<code class="language-' + language[pre.data('src').split('.').pop()] + '">' + htmlEncode(e) + '</code>').appendTo(pre);
     Prism.highlightElement(code[0]);
    }
  });
});

})();

var current_num = location.href.split('?')[1]|0 || 0;
var mode;
var doc = $(document);
var slides = $('.page'); 

slides.bind('webkitAnimationEnd', function() {
  var slide = $(this);
  $(this).removeClass('next-slide-in')
         .removeClass('next-slide-out')
         .removeClass('prev-slide-in')
         .removeClass('prev-slide-out');
});

show(current_num);

function next() {
  if (!showSlideItem(slides.eq(current_num))) {
    return;
  }
  var copy_num = current_num;
  current_num = current_num + 1 >= slides.length ? slides.length - 1 : current_num + 1;
  if (copy_num === current_num) {
    return;
  }
  doc.trigger('pagechange', [current_num, 'next']);
}

function prev() {
  var copy_num = current_num;
  current_num = current_num - 1 < 0 ? 0 : current_num - 1;
  if (copy_num === current_num) {
    return;
  }
  doc.trigger('pagechange', [current_num, 'prev']);
}

function show(num, direction) {
  if (!direction) {
    slides.eq(num).addClass('current-slide');
     return;
  }

  slides.removeClass('current-slide');
  var node = slides.eq(num).addClass('current-slide');
  var relateNode;

  if (direction === 'next') {
    relateNode = slides.eq(num - 1 < 0? 0 : num - 1);
  } else if (direction === 'prev') {
    relateNode = slides.eq(num + 1 >= slides.length ? slides.lenght - 1 : num + 1);
  }

  node.addClass(direction + '-slide-in');
  relateNode.addClass(direction + '-slide-out');
}

function makeURL(num) {
  var url = location.href;
  url = url.indexOf('?') ? url.split('?')[0] : url;
  return url + '?' + num;
}


doc.on('keyup', function(e) {
  e.preventDefault();
  if (('39,32,74,').indexOf(e.keyCode + ',') + 1) {
    next();
  }
  else if (('37,38,75,').indexOf(e.keyCode + ',') + 1) {
    prev();
  }
  else if (e.keyCode == 40) {
    showSlideItem(slides.eq(current_num));
  }
})
.swipeLeft(function() {
      next();
})
.swipeRight(function() {
      prev();
})
.on('pagechange', function(e, num, direction) {
  show(num, direction);
  if (mode === 'fullscreen') {
    return;
  }
  history.pushState(null, '第' + current_num + '页', makeURL(current_num));
});

function showSlideItem(page) {
  var item = page.find('.slide-item');
  if (item.length == 0) {
    return 'end';
  }
  item = item.eq(0)
  setTimeout(function() {
  $('.current-slide')[0].scrollTop = 100000;
  }, 100);
  if (item.data('action')) {
    var act = item.data('action');
    if (window[act]) {
      (window[act]).call(null, item);
    } else {
      try {
        eval(act);
      } catch(e) {}
    }
  }
  item.removeClass('slide-item').addClass('slide-item-in');
}

$('.page').on('click', function(e) {
  if (e.target.tagName == 'A') {
    return;
  }
  next();
})
.on('longTap', function(e) {
  if (e.target.tagName == 'A') {
    return;
  }
  next();
});



;(function() {
  document.cancelFullScreen = document.webkitCancelFullScreen 
                           || document.mozCancelFullScreen
                           || document.cancelFullScreen;

  document.body.requestFullScreen = document.body.webkitRequestFullScreen 
                                 || document.body.mozRequestFullScreen
                                 || document.body.requestFullScreen;

  var bn = $('.toggle-fullscreen').bind('change', function() {
    if (this.checked) {
      document.body.requestFullScreen();
    } else {
      document.cancelFullScreen();
    }
  });

  document.onfullscreenchange = document.onwebkitfullscreenchange =
	document.onmozfullscreenchange = function() {
    var is_full = document.webkitIsFullScreen || document.mozFullScreen ||
		document.isFullScreen;
    if(is_full) {
      mode = 'fullscreen';
    } else {
      mode = 'normal';
      bn[0].checked = '';
      history.pushState(null, '第' + current_num + '页', makeURL(current_num));
    }
  };

})();


var swipeDelay;
$('.bn-toggle-gesture input').bind('change', function() {
  if (this.checked) {
     initializeWebcamSwiper();
  } else {
     destroyWebcamSwiper();
  }
});

$('body').bind('webcamSwipeLeft', function() {
  swipeDelay && clearTimeout(swipeDelay);
  swipeDelay = setTimeout(function() {
    next();
  }, 500);
});
//$('body').bind('webcamSwipeRight', function() {
//swipeDelay && clearTimeout(swipeDelay);
//swipeDelay = setTimeout(function() {
//  prev();
//}, 1000);
//});

if (!$.browser.webkit) {
  $(function() {
    $('.page article').hide();
    $('.no-support').show();
  });
}
