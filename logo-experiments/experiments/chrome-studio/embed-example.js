// The tuning UI is hidden; mouse/touch interaction remains active.
PanoramaChrome.mount('#hero-logo', {
  controls: false,
  shape: 'logo',
  resolution: 480,
  bevel: 1.2,
  speed: 0.65,
  flow: 1.4,
  variety: 0.8,
  contrast: 1,
  interaction: 1.5,
  scale: 1.2
}).then(animation => {
  window.heroChrome = animation;
  // For your own logo, use a same-origin URL:
  // return animation.loadLogo('/assets/my-logo.svg', 'auto');
}).catch(console.error);
