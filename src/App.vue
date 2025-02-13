<template>
  <div class="app" @dblclick="showDoubleClickEasterEgg">
    <div id="bg-canvas"></div>
    <div class="hearts-container"></div>
    <div class="content" v-show="!showFireworks">
      <div class="music-control" @click="toggleMusic">
        <div class="music-icon" :class="{ 'is-playing': isPlaying }">
          <span class="line line-1"></span>
          <span class="line line-2"></span>
          <span class="line line-3"></span>
          <span class="line line-4"></span>
        </div>
      </div>
      <div class="message-container">
        <div class="message-box" :class="{ 'show-buttons': currentTextIndex >= loveTexts.length }">
          <div v-if="currentTextIndex < loveTexts.length" class="typewriter animate__animated animate__fadeIn">
            <div ref="typewriterElement"></div>
          </div>
          <div v-else class="buttons animate__animated animate__bounceIn">
            <button class="accept-btn" @click="handleAccept">
              <span class="button-text">Yes, I Do</span>
              <div class="button-glow"></div>
            </button>
            <button class="reject-btn" @click="handleReject">
              <span class="button-text">Let Me Think</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showFireworks" class="fireworks-container">
      <div class="love-message">
        <div class="love-text animate__animated animate__heartBeat">
          <span class="name">小车</span>
          <span class="heart">💗</span>
          <span class="name">小赵</span>
        </div>
        <div class="love-date">{{ new Date().toLocaleDateString() }}</div>
      </div>
    </div>
    <audio ref="bgMusic" loop>
      <source src="/love-song.mp3" type="audio/mp3">
    </audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Typewriter from 'typewriter-effect/dist/core'
import { initBackground } from './utils/background'
import { initFireworks } from './utils/fireworks'
import { createHearts } from './utils/hearts'
import 'animate.css'

const currentTextIndex = ref(0)
const typewriterElement = ref(null)
const showFireworks = ref(false)
const isPlaying = ref(false)
const bgMusic = ref(null)

// 修改摇一摇检测相关变量
let lastTime = 0
let lastX = 0
let lastY = 0
let lastZ = 0
const SHAKE_THRESHOLD = 10 // 降低阈值，使更容易触发

const loveTexts = [
  "小车：",
  "从第一次遇见你",
  "你的善良，你的温柔",
  "让我无法自拔",
  "你就像星空中最亮的星星",
  "照亮了我的世界",
  "我喜欢你",
  "可以做我的女朋友吗？"
]

let bgScene, bgRenderer, bgCamera, bgAnimate
let animationFrameId
let typewriter = null

function initTypewriter() {
  if (!typewriterElement.value) return
  if (typewriter) {
    typewriter.stop()
    typewriter = null
  }

  const options = {
    delay: 80,
    cursor: '|',
    cursorClassName: 'typewriter-cursor',
    wrapperClassName: 'typewriter-wrapper'
  }

  typewriter = new Typewriter(typewriterElement.value, options)

  // 构建打字机序列
  let sequence = typewriter

  loveTexts.forEach((text, index) => {
    if (index > 0) {
      sequence = sequence
        .pauseFor(800)
        .deleteAll(1)
        .pauseFor(300)
    }
    sequence = sequence
      .pauseFor(500)
      .typeString(text)
      .pauseFor(1500)
      .callFunction(() => {
        currentTextIndex.value = index
      })
  })

  sequence
    .callFunction(() => {
      currentTextIndex.value = loveTexts.length
      if (typewriter) {
        typewriter.stop()
        typewriter = null
      }
    })
    .start()
}

// 修改摇一摇检测函数
function handleShake(event) {
  const current = event.accelerationIncludingGravity
  if (!current) return

  const currentTime = new Date().getTime()
  const diffTime = currentTime - lastTime

  if (diffTime > 100) {
    const deltaX = Math.abs(current.x - lastX)
    const deltaY = Math.abs(current.y - lastY)
    const deltaZ = Math.abs(current.z - lastZ)

    if ((deltaX > SHAKE_THRESHOLD && deltaY > SHAKE_THRESHOLD) || 
        (deltaX > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD) || 
        (deltaY > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD)) {
      showShakeEasterEgg()
    }

    lastTime = currentTime
    lastX = current.x
    lastY = current.y
    lastZ = current.z
  }
}

// 修改彩蛋显示函数
function showShakeEasterEgg() {
  showEasterEgg('感谢小车打赏的五毛钱❤️')
}

// 添加双击彩蛋函数
function showDoubleClickEasterEgg() {
  showEasterEgg('获得抱抱体验一次（立即执行）')
}

// 统一的彩蛋显示函数
function showEasterEgg(text) {
  const existingEasterEgg = document.querySelector('.easter-egg')
  if (existingEasterEgg) {
    document.body.removeChild(existingEasterEgg)
  }

  const easterEgg = document.createElement('div')
  easterEgg.className = 'easter-egg animate__animated animate__bounceIn'
  easterEgg.innerHTML = text
  document.body.appendChild(easterEgg)

  setTimeout(() => {
    easterEgg.classList.remove('animate__bounceIn')
    easterEgg.classList.add('animate__bounceOut')
    setTimeout(() => {
      if (document.body.contains(easterEgg)) {
        document.body.removeChild(easterEgg)
      }
    }, 1000)
  }, 2000)
}

onMounted(() => {
  const container = document.getElementById('bg-canvas')
  ;({ scene: bgScene, renderer: bgRenderer, camera: bgCamera, animate: bgAnimate } = initBackground(container))
  
  function animate() {
    animationFrameId = requestAnimationFrame(animate)
    bgAnimate()
    bgRenderer.render(bgScene, bgCamera)
  }
  
  animate()
  createHearts()
  setTimeout(() => {
    initTypewriter()
  }, 1000)

  // 修改摇一摇事件监听，添加权限请求
  if (window.DeviceMotionEvent) {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+ 需要请求权限
      DeviceMotionEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleShake)
          }
        })
        .catch(console.error)
    } else {
      // 其他设备直接添加监听
      window.addEventListener('devicemotion', handleShake)
    }
  }
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (bgRenderer) {
    bgRenderer.dispose()
  }
  if (typewriter) {
    typewriter.stop()
    typewriter = null
  }
  // 移除摇一摇事件监听
  if (window.DeviceMotionEvent) {
    window.removeEventListener('devicemotion', handleShake)
  }
})

function handleAccept() {
  showFireworks.value = true
  initFireworks()
  if (isPlaying.value) {
    bgMusic.value.play()
  }
}

function handleReject() {
  alert('抱歉，这个按钮不能点击哦 😊')
}

function toggleMusic() {
  if (isPlaying.value) {
    bgMusic.value.pause()
  } else {
    bgMusic.value.play()
  }
  isPlaying.value = !isPlaying.value
}
</script>

<style>
/* 在样式的最前面添加全局滚动控制 */
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
  touch-action: none;
  -webkit-overflow-scrolling: none;
}

.app {
  width: 100%;
  height: 100%;
  position: fixed;
  overflow: hidden;
  background: #000;
  font-family: 'Dancing Script', cursive;
  touch-action: none;
  -webkit-overflow-scrolling: none;
  left: 0;
  top: 0;
}

@import 'animate.css';
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

/* 添加移动端媒体查询 */
@media screen and (max-width: 768px) {
  .content {
    padding: 0;
  }

  .message-container {
    margin: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translateY(-200px);
  }

  .message-box {
    min-width: unset;
    width: 85vw;
    padding: 30px 20px;
    font-size: 24px;
    max-height: 70vh;
    overflow: hidden;
  }

  .typewriter {
    font-size: 20px;
    min-height: 36px;
    margin: 10px 0;
  }

  .buttons {
    margin-top: 30px;
    gap: 20px;
    flex-direction: column;
  }

  button {
    padding: 15px 30px;
    font-size: 20px;
    width: 200px;
    margin: 0 auto;
  }

  .love-text {
    font-size: 48px;
    padding: 30px;
    gap: 15px;
  }

  .heart {
    font-size: 42px;
  }

  .love-date {
    font-size: 18px;
  }

  .music-control {
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
  }

  .love-message {
    margin-top: -10vh;
    width: 90vw;
  }

  .easter-egg {
    font-size: 18px;
    padding: 15px 30px;
    width: 80%;
    white-space: normal;
    text-align: center;
  }
}

/* 添加更小屏幕的适配 */
@media screen and (max-width: 380px) {
  .message-box {
    padding: 25px 15px;
  }

  .typewriter {
    font-size: 18px;
    min-height: 32px;
  }

  button {
    padding: 12px 25px;
    font-size: 18px;
    width: 180px;
  }

  .love-text {
    font-size: 36px;
    padding: 25px;
  }

  .heart {
    font-size: 32px;
  }
}

/* 横屏适配 */
@media screen and (max-height: 600px) and (orientation: landscape) {
  .content {
    padding: 0;
    align-items: center;
  }

  .message-container {
    margin: 0;
    transform: translateY(-200px);
  }

  .message-box {
    padding: 20px 30px;
  }

  .typewriter {
    min-height: 32px;
    font-size: 20px;
  }

  .buttons {
    margin-top: 20px;
  }

  .love-message {
    margin-top: 0;
  }

  .love-text {
    padding: 20px;
    font-size: 42px;
  }
}

#bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.content {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 0;
}

.message-container {
  perspective: 1000px;
  transform-style: preserve-3d;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  touch-action: none;
  -webkit-overflow-scrolling: none;
  overflow: hidden;
  transform: translateY(-200px);
}

.message-box {
  text-align: center;
  font-size: 32px;
  padding: 40px 60px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.05);
  transform: translateZ(0);
  transition: all 0.5s ease;
  min-width: 600px;
  max-width: 80vw;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.message-box.show-buttons {
  transform: translateZ(50px);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.08);
}

.typewriter {
  margin: 15px 0;
  min-height: 48px;
  line-height: 1.6;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
  font-size: 28px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.95);
}

.typewriter-cursor {
  color: #fff;
  animation: blink 0.7s infinite;
  margin-left: 2px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

@keyframes blink {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

.buttons {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 40px;
}

button {
  position: relative;
  padding: 18px 36px;
  font-size: 24px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  font-family: 'Dancing Script', cursive;
}

.button-text {
  position: relative;
  z-index: 1;
}

.accept-btn {
  background: linear-gradient(45deg, #ff69b4, #da70d6);
  color: white;
  transform-style: preserve-3d;
  transform: perspective(1000px) translateZ(0);
}

.accept-btn:hover {
  transform: perspective(1000px) translateZ(30px) scale(1.1);
  box-shadow: 0 20px 40px rgba(255, 105, 180, 0.4);
}

.button-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.accept-btn:hover .button-glow {
  opacity: 0.5;
  animation: rotate 3s linear infinite;
}

.reject-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: perspective(1000px) translateZ(0);
}

.reject-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: perspective(1000px) translateZ(20px);
}

.fireworks-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
}

.love-message {
  text-align: center;
  transform-style: preserve-3d;
  transform: perspective(1000px) translateZ(0);
  transition: transform 0.5s ease;
  margin: 0; /* 移除上边距 */
}

.love-message:hover {
  transform: perspective(1000px) translateZ(50px);
}

.love-text {
  font-size: 84px;
  padding: 40px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 0 50px rgba(255, 105, 180, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 20px;
}

.name {
  background: linear-gradient(45deg, #ff69b4, #da70d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(255, 105, 180, 0.5);
}

.heart {
  font-size: 72px;
  animation: heartbeat 1.5s ease-in-out infinite;
  color: #ff69b4;
  text-shadow: 0 0 30px rgba(255, 105, 180, 0.8);
}

.love-date {
  margin-top: 20px;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.music-control {
  position: fixed;
  top: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 4;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.music-icon {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 5px;
}

.line {
  width: 4px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.line-1 { height: 16px; }
.line-2 { height: 24px; }
.line-3 { height: 12px; }
.line-4 { height: 20px; }

.is-playing .line {
  animation: musicBars 1.5s ease infinite;
}

.is-playing .line-1 { animation-delay: 0s; }
.is-playing .line-2 { animation-delay: 0.2s; }
.is-playing .line-3 { animation-delay: 0.4s; }
.is-playing .line-4 { animation-delay: 0.6s; }

@keyframes musicBars {
  0% { height: 12px; }
  50% { height: 24px; }
  100% { height: 12px; }
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes glow {
  0% { text-shadow: 0 0 20px #fff, 0 0 30px #ff69b4, 0 0 40px #ff69b4; }
  100% { text-shadow: 0 0 10px #fff, 0 0 20px #da70d6, 0 0 30px #da70d6; }
}

/* 确保所有可滚动容器都禁用滚动 */
.message-container,
.typewriter,
.buttons,
.fireworks-container,
.love-message {
  touch-action: none;
  -webkit-overflow-scrolling: none;
  overflow: hidden;
}

.easter-egg {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 40px;
  border-radius: 50px;
  font-size: 24px;
  color: #ff69b4;
  z-index: 9999;
  box-shadow: 0 0 30px rgba(255, 105, 180, 0.5);
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
  white-space: nowrap;
  animation-duration: 1s;
  pointer-events: none;
}
</style> 