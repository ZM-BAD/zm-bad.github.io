(function() {
  var rocket = document.getElementById('rocket');
  if (!rocket) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 500) {
      rocket.classList.add('show');
    } else {
      rocket.classList.remove('show');
    }
  });

  rocket.addEventListener('click', function(e) {
    e.preventDefault();
    rocket.classList.add('launch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(function() {
      rocket.classList.remove('show', 'launch');
    }, 500);
  });
})();
