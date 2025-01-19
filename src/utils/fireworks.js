export function initFireworks() {
  const colors = [
    { r: 255, g: 105, b: 180 }, // hot pink
    { r: 218, g: 112, b: 214 }, // orchid
    { r: 255, g: 192, b: 203 }, // pink
    { r: 255, g: 130, b: 171 }, // violet red
    { r: 255, g: 182, b: 193 }  // light pink
  ];
  
  function createFirework(x, y) {
    const particles = 150;
    const explosion = document.createElement('div');
    explosion.style.position = 'absolute';
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    explosion.style.width = '4px';
    explosion.style.height = '4px';
    explosion.style.transform = 'translate(-50%, -50%)';
    document.querySelector('.fireworks-container').appendChild(explosion);

    // 创建烟花上升轨迹
    const trail = document.createElement('div');
    trail.style.position = 'absolute';
    trail.style.left = `${x}px`;
    trail.style.bottom = '0';
    trail.style.width = '3px';
    trail.style.height = '100vh';
    trail.style.transform = 'translateX(-50%)';
    const color = colors[Math.floor(Math.random() * colors.length)];
    trail.style.background = `linear-gradient(to top, transparent, rgba(${color.r}, ${color.g}, ${color.b}, 0.5))`;
    trail.style.opacity = '0';
    document.querySelector('.fireworks-container').appendChild(trail);

    // 烟花上升动画
    trail.animate([
      { opacity: 0.8, height: '0' },
      { opacity: 0, height: `${window.innerHeight - y}px` }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).onfinish = () => trail.remove();

    // 创建闪光效果
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.left = `${x}px`;
    flash.style.top = `${y}px`;
    flash.style.width = '100px';
    flash.style.height = '100px';
    flash.style.transform = 'translate(-50%, -50%)';
    flash.style.background = `radial-gradient(circle, rgba(${color.r}, ${color.g}, ${color.b}, 0.8) 0%, transparent 70%)`;
    flash.style.opacity = '0';
    document.querySelector('.fireworks-container').appendChild(flash);

    flash.animate([
      { opacity: 0.8, transform: 'translate(-50%, -50%) scale(0.2)' },
      { opacity: 0, transform: 'translate(-50%, -50%) scale(2)' }
    ], {
      duration: 800,
      easing: 'ease-out'
    }).onfinish = () => flash.remove();

    for (let i = 0; i < particles; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.left = '2px';
      particle.style.top = '2px';
      particle.style.width = '3px';
      particle.style.height = '3px';
      particle.style.borderRadius = '50%';
      const particleColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.backgroundColor = `rgb(${particleColor.r}, ${particleColor.g}, ${particleColor.b})`;
      particle.style.transform = 'translate(-50%, -50%)';
      particle.style.boxShadow = `0 0 ${Math.random() * 10 + 5}px ${Math.random() * 3 + 2}px rgba(${particleColor.r}, ${particleColor.g}, ${particleColor.b}, 0.8)`;
      
      const angle = (i * 360 / particles) * Math.PI / 180;
      const velocity = 3 + Math.random() * 3;
      const lifetime = 1000 + Math.random() * 1000;
      const spread = Math.random() * 0.2;
      const rotationSpeed = (Math.random() - 0.5) * 0.1;
      
      explosion.appendChild(particle);
      
      let start = Date.now();
      let rotation = 0;
      
      function animate() {
        const elapsed = Date.now() - start;
        const progress = elapsed / lifetime;
        
        if (progress < 1) {
          rotation += rotationSpeed;
          const spreadAngle = angle + progress * spread * Math.PI;
          const x = Math.cos(spreadAngle + rotation) * velocity * elapsed * 0.1;
          const y = Math.sin(spreadAngle + rotation) * velocity * elapsed * 0.1 + (0.5 * 9.8 * Math.pow(elapsed / 1000, 2));
          
          particle.style.transform = `translate(${x}px, ${y}px) scale(${1 - progress})`;
          particle.style.opacity = (1 - progress) * (1 - progress);
          
          requestAnimationFrame(animate);
        } else {
          particle.remove();
        }
      }
      
      requestAnimationFrame(animate);
    }
    
    setTimeout(() => explosion.remove(), 2000);
  }
  
  function randomFirework() {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * (window.innerHeight * 0.6);
    createFirework(x, y);
  }
  
  // 初始烟花
  for (let i = 0; i < 8; i++) {
    setTimeout(randomFirework, i * 300);
  }
  
  // 持续放烟花
  setInterval(() => {
    const count = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < count; i++) {
      setTimeout(randomFirework, i * 200);
    }
  }, 1500);
} 