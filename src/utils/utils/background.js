import * as THREE from 'three'

export function initBackground(container) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)
  
  // 创建多层星空
  function createStarField(count, size, depth) {
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 2000
      const y = (Math.random() - 0.5) * 2000
      const z = -Math.random() * depth
      vertices.push(x, y, z)
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    
    const material = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: size,
      transparent: true,
      opacity: Math.random() * 0.5 + 0.5,
      blending: THREE.AdditiveBlending
    })
    
    return new THREE.Points(geometry, material)
  }
  
  // 添加多层星空
  const starLayers = [
    { count: 5000, size: 0.1, depth: 1000 },
    { count: 3000, size: 0.2, depth: 1500 },
    { count: 1000, size: 0.3, depth: 2000 }
  ]
  
  starLayers.forEach(layer => {
    const starField = createStarField(layer.count, layer.size, layer.depth)
    scene.add(starField)
  })
  
  // 添加星云效果
  const nebulaMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 uv = vUv;
        float n = noise(uv * 10.0 + time * 0.1);
        vec3 color = vec3(0.5 + 0.5 * sin(time + uv.x * 5.0),
                         0.5 + 0.5 * sin(time + uv.y * 5.0),
                         0.5 + 0.5 * cos(time + uv.x * uv.y * 5.0));
        gl_FragColor = vec4(color * n * 0.3, 0.1);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
  })
  
  const nebulaGeometry = new THREE.PlaneGeometry(2000, 2000)
  const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial)
  nebula.position.z = -1000
  scene.add(nebula)
  
  camera.position.z = 5
  
  // 添加窗口大小调整监听
  window.addEventListener('resize', onWindowResize, false)
  
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  
  // 动画更新
  function animate() {
    nebulaMaterial.uniforms.time.value += 0.001
    requestAnimationFrame(animate)
    scene.children.forEach(child => {
      if (child instanceof THREE.Points) {
        child.rotation.y += 0.0001
        child.rotation.x += 0.0001
      }
    })
    renderer.render(scene, camera)
  }
  
  animate()
  
  return { scene, camera, renderer }
}