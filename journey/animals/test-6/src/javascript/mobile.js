if (window.innerWidth <= 800) {
  const circle = document.getElementById('circle')
  circle.classList.remove('d-none')
}


let isMoving = false;
let initialX, initialY;
let lastDeltaX = 0;
let lastDeltaY = 0;


function startMoving(event) {
  isMoving = true;
  initialX = event.touches[0].clientX;
  initialY = event.touches[0].clientY;
}

function moveCircle(event) {
  // if (!isMoving) return;

  const currentX = event.touches[0].clientX;
  const currentY = event.touches[0].clientY;
  const deltaX = currentX - initialX;
  const deltaY = currentY - initialY;


circle.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

  // Generate Arrow events based on movement direction
  if (deltaY < -10) {
    // Move Upward
    if (lastDeltaY >= -10) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    }
  } else if (deltaY > 10) {
    // Move Downward
    if (lastDeltaY <= 10) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    }
  } else if (deltaX > 10) {
    // Move Right
    if (lastDeltaX <= 10) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    }
  } else if (deltaX < -10) {
    // Move Left
    if (lastDeltaX >= -10) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    }
  } else {
    // Circle is no longer moving in any direction
    if (lastDeltaY < -10) {
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
    } else if (lastDeltaY > 10) {
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
    } else if (lastDeltaX > 10) {
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));
    } else if (lastDeltaX < -10) {
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
    }
  }

  // Store the last movement for 'keyup' event
  lastDeltaX = deltaX;
  lastDeltaY = deltaY;
}

function stopMoving() {
  isMoving = false;
  const circle = document.getElementById('circle');
  circle.style.transform = 'translate(0, 0)';

  // Dispatch 'keyup' events when the circle stops moving
  if (lastDeltaY < -10) {
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
  } else if (lastDeltaY > 10) {
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
  } else if (lastDeltaX > 10) {
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));
  } else if (lastDeltaX < -10) {
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
  }

  lastDeltaX = 0;
  lastDeltaY = 0;
}
