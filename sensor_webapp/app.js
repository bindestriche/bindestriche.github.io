if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

window.addEventListener('devicemotion', function(event) {
  document.getElementById('acc-x').textContent = event.accelerationIncludingGravity.x.toFixed(2);
  document.getElementById('acc-y').textContent = event.accelerationIncludingGravity.y.toFixed(2);
  document.getElementById('acc-z').textContent = event.accelerationIncludingGravity.z.toFixed(2);
});

window.addEventListener('deviceorientation', function(event) {
  document.getElementById('ori-alpha').textContent = event.alpha.toFixed(2);
  document.getElementById('ori-beta').textContent = event.beta.toFixed(2);
  document.getElementById('ori-gamma').textContent = event.gamma.toFixed(2);
});
