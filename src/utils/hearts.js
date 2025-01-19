export function createHearts() {
  const container = document.querySelector('.hearts-container');
  const colors = ['#ff69b4', '#ff1493', '#ff0000', '#ff69b4', '#ff4081', '#ff6b6b'];
  
  function createHeart() {
    const heart = document.createElement('div');
    heart.innerHTML = '❤';
    heart.style.position = 'absolute';
    heart.style.fontSize = Math.random() * 30 + 15 + 'px';
    heart.style.color = colors[Math.floor(Math.random() * colors.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.top = '120%';
    heart.style.opacity = '0.8';
    heart.style.filter = 'blur(0.5px)';
    heart.style.textShadow = `0 0 10px ${heart.style.color}`;
    heart.style.transform = 'scale(0)';
    heart.style.transition = 'transform 0.5s ease-out';
    container.appendChild(heart);
    
    // 添加出现动画
    setTimeout(() => {
      heart.style.transform = 'scale(1)';
    }, 100);

    // 随机摆动动画
    const duration = Math.random() * 5 + 8;
    const amplitude = Math.random() * 50 + 25;
    const startTime = Date.now();
    
    function animate() {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        const x = Math.sin(elapsed * 2) * amplitude;
        const y = -progress * window.innerHeight * 1.2;
        heart.style.transform = `translate(${x}px, ${y}px) rotate(${x}deg)`;
        requestAnimationFrame(animate);
      } else {
        heart.remove();
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  // 初始化一些心形
  for (let i = 0; i < 15; i++) {
    setTimeout(createHeart, i * 200);
  }
  
  // 持续创建新的心形
  setInterval(() => {
    if (Math.random() < 0.7) {
      createHeart();
    }
  }, 500);
  
  // 添加 CSS 动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float {
      0% {
        transform: translateY(0) rotate(0deg) scale(1);
        opacity: 0.8;
        filter: blur(0.5px);
      }
      50% {
        transform: translateY(-50vh) rotate(180deg) scale(1.2);
        opacity: 0.9;
        filter: blur(1px);
      }
      100% {
        transform: translateY(-100vh) rotate(360deg) scale(1);
        opacity: 0;
        filter: blur(2px);
      }
    }
  `;
  document.head.appendChild(style);
} 