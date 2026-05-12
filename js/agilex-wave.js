document.addEventListener("DOMContentLoaded", function () {
  const mascot = document.querySelector("[data-agilex-wave]");

  if (!mascot) return;

  const frames = [
    { src: "img/agilex/agile-wave1e3.png", duration: 80 },
    { src: "img/agilex/agilex-wave2.png", duration: 90 },
    { src: "img/agilex/agile-wave1e3.png", duration: 80 },
    { src: "img/agilex/agilex-wave4.png", duration: 95 },
    { src: "img/agilex/agilex-wave4.png", duration: 120 },
  ];

  const animationSpeed = 1;
  let isAnimating = false;
  let shouldReplay = false;

  frames.forEach(function (frame) {
    const image = new Image();
    image.src = frame.src;
  });

  function showFrame(src) {
    mascot.src = src;
  }

  function finishWave() {
    isAnimating = false;

    if (shouldReplay) {
      shouldReplay = false;
      playWave();
    }
  }

  function playFrame(index) {
    if (index >= frames.length) {
      finishWave();
      return;
    }

    const frame = frames[index];
    showFrame(frame.src);

    window.setTimeout(function () {
      playFrame(index + 1);
    }, frame.duration * animationSpeed);
  }

  function playWave() {
    if (isAnimating) {
      shouldReplay = true;
      return;
    }

    isAnimating = true;
    playFrame(0);
  }

  window.addEventListener("scroll", playWave, { passive: true });
});
