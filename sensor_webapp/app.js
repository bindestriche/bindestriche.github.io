function handleMotion(event) {
  const acc = event.accelerationIncludingGravity;
  if (acc) {
    document.getElementById('acc-x').textContent = acc.x?.toFixed(2) ?? '0';
    document.getElementById('acc-y').textContent = acc.y?.toFixed(2) ?? '0';
    document.getElementById('acc-z').textContent = acc.z?.toFixed(2) ?? '0';
  }
}

function handleOrientation(event) {
  document.getElementById('ori-alpha').textContent = event.alpha?.toFixed(2) ?? '0';
  document.getElementById('ori-beta').textContent = event.beta?.toFixed(2) ?? '0';
  document.getElementById('ori-gamma').textContent = event.gamma?.toFixed(2) ?? '0';
}

function initSensorListeners() {
  // Some browsers (iOS 13+, maybe future Android) need permission
  if (typeof DeviceMotionEvent?.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', handleMotion);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          alert("Sensor permission denied.");
        }
      })
      .catch(console.error);
  } else {
    // No explicit permission needed (e.g., Android Chrome)
    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
  }
}

// Run on load
window.addEventListener('load', initSensorListeners);
