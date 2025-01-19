import * as THREE from 'three'

export function initBackground(container) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000)
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  })
  
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)
  
  // 创建星云效果
  const galaxyGeometry = new THREE.BufferGeometry()
  const galaxyMaterial = new THREE.PointsMaterial({
    size: 2,
    sizeAttenuation: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  })
  
  const positions = []
  const colors = []
  const scales = []
  
  const branches = 5
  const particlesCount = 15000
  const radius = 800
  const spin = 1
  const randomness = 0.5
  const randomnessPower = 3
  const insideColor = new THREE.Color('#ff69b4')
  const outsideColor = new THREE.Color('#4169e1')
  
  for(let i = 0; i < particlesCount; i++) {
    // Position
    const fraction = i / particlesCount
    const branchAngle = (i % branches) * Math.PI * 2 / branches
    
    const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    
    const radius_i = fraction * radius
    
    positions.push(
      Math.cos(branchAngle + radius_i * spin) * radius_i + randomX * randomness * radius,
      randomY * randomness * radius * 0.5,
      Math.sin(branchAngle + radius_i * spin) * radius_i + randomZ * randomness * radius
    )
    
    // Color
    const mixedColor = insideColor.clone()
    mixedColor.lerp(outsideColor, fraction)
    colors.push(mixedColor.r, mixedColor.g, mixedColor.b)
    
    // Scale
    scales.push(Math.random())
  }
  
  galaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  galaxyGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  galaxyGeometry.setAttribute('aScale', new THREE.Float32BufferAttribute(scales, 1))
  
  const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial)
  scene.add(galaxy)
  
  // 添加光晕效果
  const bloomPass = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      luminosity: { value: 1 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float luminosity;
      varying vec2 vUv;
      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        vec3 luma = vec3(0.299, 0.587, 0.114);
        float v = dot(texel.xyz, luma);
        gl_FragColor = vec4(texel.rgb * luminosity, texel.a);
      }
    `
  })
  
  const bloomMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    bloomPass
  )
  bloomMesh.material.depthTest = false
  bloomMesh.material.depthWrite = false
  scene.add(bloomMesh)
  
  camera.position.z = 1000
  camera.position.y = 200
  camera.lookAt(scene.position)
  
  // 添加窗口大小调整监听
  window.addEventListener('resize', onWindowResize, false)
  
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  
  // 动画更新函数
  let time = 0
  function animate() {
    time += 0.001
    
    galaxy.rotation.y += 0.0003
    galaxy.rotation.z += 0.0001
    
    // 相机轨道运动
    const radius = 1200
    camera.position.x = Math.cos(time * 0.2) * radius
    camera.position.z = Math.sin(time * 0.2) * radius
    camera.position.y = Math.sin(time * 0.1) * 200 + 200
    camera.lookAt(scene.position)
    
    // 更新光晕效果
    bloomPass.uniforms.luminosity.value = 1 + Math.sin(time * 2) * 0.2
  }
  
  return { scene, camera, renderer, animate }
} 