export function createHearts() {
  const container = document.querySelector('.hearts-container')
  
  function createHeart() {
    const heart = document.createElement('div')
    heart.className = 'heart'
    heart.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}vw;
      top: -20px;
      transform: scale(${Math.random() * 0.5 + 0.5});
      color: ${getRandomColor()};
      animation: fall ${Math.random() * 3 + 2}s linear;
      z-index: 1;
      font-size: 20px;
      text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
    `
    heart.innerHTML = '❤'
    container.appendChild(heart)
    
    heart.addEventListener('animationend', () => {
      heart.remove()
    })
  }
  
  function getRandomColor() {
    const colors = [
      '#ff69b4',
      '#ff1493',
      '#ff4081',
      '#ff6b6b',
      '#ff7f50'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }
  
  // 添加 CSS 动画
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fall {
      0% {
        transform: translateY(0) rotate(0deg) scale(1);
      }
      100% {
        transform: translateY(100vh) rotate(720deg) scale(0);
      }
    }
  `
  document.head.appendChild(style)
  
  // 定期创建爱心
  setInterval(createHeart, 300)
} 