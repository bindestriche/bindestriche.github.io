async function requestSensorPermission() {
  if (typeof DeviceMotionEvent?.requestPermission === 'function') {
    try {
      const response = await DeviceMotionEvent.requestPermission();
      if (response !== 'granted') {
        alert('Permission denied for accelerometer');
        return false;
      }
    } catch (e) {
      alert('Error requesting motion permission');
      return false;
    }
  }

  if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
    try {
      const response = await DeviceOrientationEvent.requestPermission();
      if (response !== 'granted') {
        alert('Permission denied for orientation');
        return false;
      }
    } catch (e) {
      alert('Error requesting orientation permission');
      return false;
    }
  }

  return true;
}

async function initSensors() {
  const granted = await requestSensorPermission();
  if (!granted) return;

  window.addEventListener('devicemotion', (event) => {
    document.getElementById('acc-x').textContent = event.accelerationIncludingGravity.x?.toFixed(2) ?? '0';
    document.getElementById('acc-y').textContent = event.accelerationIncludingGravity.y?.toFixed(2) ?? '0';
    document.getElementById('acc-z').textContent = event.accelerationIncludingGravity.z?.toFixed(2) ?? '0';
  });

  window.addEventListener('deviceorientation', (event) => {
    document.getElementById('ori-alpha').textContent = event.alpha?.toFixed(2) ?? '0';
    document.getElementById('ori-beta').textContent = event.beta?.toFixed(2) ?? '0';
    document.getElementById('ori-gamma').textContent = event.gamma?.toFixed(2) ?? '0';
  });
}

initSensors();
