window.onload = function() {
  var doc = doc = document.documentElement,
    top;

  window.onscroll = function() {
    top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

    if (top > 330) {
      document.body.className = 'scrolltop-more-than-330';
      document.getElementById('article-nav').style.top = (top-90)+'px';
    } else {
      document.body.className = '';
    }
  }
}