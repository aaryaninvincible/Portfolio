import React, { useEffect, useRef, useState } from 'react';

declare const THREE: any;

export const SeaFooter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState(60);
  const [drifting, setDrifting] = useState(true);
  const [testTimeIndex, setTestTimeIndex] = useState(0); // 0: Auto, 1: Morning, 2: Midday, 3: Golden, 4: Dusk, 5: Night
  const [weather, setWeather] = useState<'CLEAR' | 'RAIN'>('CLEAR');
  const [timeLabel, setTimeLabel] = useState('GOLDEN HOUR');
  const [timeOfDay, setTimeOfDay] = useState(75);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Dynamic Quote overlays
  const [quoteTitle, setQuoteTitle] = useState('I LOVE SUNSETS');
  const [quoteText, setQuoteText] = useState('"Sunsets are proof that no matter what happens, every day can end beautifully."');
  const [showQuote, setShowQuote] = useState(true);

  useEffect(() => {
    if (!containerRef.current || typeof THREE === 'undefined') return;

    const seaContainer = containerRef.current;
    let seaScene: any, seaCamera: any, seaRenderer: any;
    let water: any, sun: any, sky: any;
    let rain: any, shipGroup: any, splashes: any;
    let clouds: any, cloudGroup: any, stars: any, moon: any, birdsGroup: any, birds: any[] = [];
    let seaTime = 0;
    let lastTime = performance.now();
    let frameCount = 0;
    let isSeaActive = true;
    let animationFrameId: number;

    function initSea() {
      seaRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      seaRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize pixel ratio
      seaRenderer.setSize(seaContainer.clientWidth, seaContainer.clientHeight);
      seaRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      seaRenderer.toneMappingExposure = 0.5;
      seaContainer.appendChild(seaRenderer.domElement);

      seaScene = new THREE.Scene();
      seaScene.fog = new THREE.FogExp2(0x001e0f, 0.001);

      seaCamera = new THREE.PerspectiveCamera(55, seaContainer.clientWidth / seaContainer.clientHeight, 1, 20000);
      seaCamera.position.set(0, 30, 100);

      sun = new THREE.Vector3();

      const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
      
      water = new THREE.Water(
        waterGeometry,
        {
          textureWidth: 512,
          textureHeight: 512,
          waterNormals: new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/waternormals.jpg', function ( texture: any ) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }),
          sunDirection: new THREE.Vector3(),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 3.7,
          fog: seaScene.fog !== undefined
        }
      );
      water.rotation.x = - Math.PI / 2;
      seaScene.add(water);

      sky = new THREE.Sky();
      sky.scale.setScalar(10000);
      seaScene.add(sky);

      const skyUniforms = sky.material.uniforms;
      skyUniforms[ 'turbidity' ].value = 10;
      skyUniforms[ 'rayleigh' ].value = 2;
      skyUniforms[ 'mieCoefficient' ].value = 0.005;
      skyUniforms[ 'mieDirectionalG' ].value = 0.8;

      // Rain Particles using LineSegments for realistic streaks
      const RAIN_COUNT = 1500; // 1500 lines = 3000 points
      const rainGeo = new THREE.BufferGeometry();
      const rainPositions = new Float32Array(RAIN_COUNT * 2 * 3);
      for(let i=0; i<RAIN_COUNT; i++){
        const x = (Math.random() - 0.5) * 400;
        const y = Math.random() * 200;
        const z = (Math.random() - 0.5) * 200;
        
        // Start vertex of line
        rainPositions[i*6] = x;
        rainPositions[i*6+1] = y;
        rainPositions[i*6+2] = z;
        
        // End vertex of line (slightly below)
        rainPositions[i*6+3] = x;
        rainPositions[i*6+4] = y - 5;
        rainPositions[i*6+5] = z;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      const rainMat = new THREE.LineBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.5
      });
      rain = new THREE.LineSegments(rainGeo, rainMat);
      rain.visible = false;
      seaScene.add(rain);

      // Soft Volumetric Clouds Group
      cloudGroup = new THREE.Group();
      const cloudCanvas = document.createElement('canvas');
      cloudCanvas.width = 128;
      cloudCanvas.height = 128;
      const cloudCtx = cloudCanvas.getContext('2d');
      if (cloudCtx) {
        const grad = cloudCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(230, 230, 240, 0.7)');
        grad.addColorStop(0.5, 'rgba(180, 180, 190, 0.25)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        cloudCtx.fillStyle = grad;
        cloudCtx.fillRect(0, 0, 128, 128);
      }
      const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
      const cloudMat = new THREE.PointsMaterial({
        size: 180,
        map: cloudTexture,
        transparent: true,
        opacity: 0.12,
        depthWrite: false
      });
      const cloudGeo = new THREE.BufferGeometry();
      const cloudPositions = new Float32Array(35 * 3);
      for(let i = 0; i < 35; i++) {
        cloudPositions[i*3] = (Math.random() - 0.5) * 1000;
        cloudPositions[i*3+1] = 70 + Math.random() * 30; // lower down
        cloudPositions[i*3+2] = -200 - Math.random() * 300;
      }
      cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3));
      clouds = new THREE.Points(cloudGeo, cloudMat);
      cloudGroup.add(clouds);
      seaScene.add(cloudGroup);

      // Starfield (for night)
      const starGeo = new THREE.BufferGeometry();
      const starPositions = new Float32Array(300 * 3);
      for (let i = 0; i < 300; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random());
        const radius = 2500;
        starPositions[i*3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i*3+1] = radius * Math.cos(phi) + 100;
        starPositions[i*3+2] = -Math.abs(radius * Math.sin(phi) * Math.sin(theta)); // keep in front/sides
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.8,
        transparent: true,
        opacity: 0.0 // invisible during day
      });
      stars = new THREE.Points(starGeo, starMat);
      seaScene.add(stars);

      // Moon Mesh (Fully opaque bright white moon)
      const moonGeo = new THREE.SphereGeometry(14, 32, 32);
      const moonMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0
      });
      moon = new THREE.Mesh(moonGeo, moonMat);
      moon.position.set(-100, 140, -350);
      seaScene.add(moon);

      // Flying Birds Group
      birdsGroup = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const bird = new THREE.Group();
        const wingL = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.8, 0, 0), new THREE.Vector3(0, 0.6, 0)]),
          new THREE.LineBasicMaterial({ color: 0x111111 })
        );
        const wingR = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.6, 0), new THREE.Vector3(1.8, 0, 0)]),
          new THREE.LineBasicMaterial({ color: 0x111111 })
        );
        bird.add(wingL);
        bird.add(wingR);
        bird.position.set(
          (Math.random() - 0.5) * 300,
          45 + Math.random() * 25,
          -80 - Math.random() * 120
        );
        (bird as any)._wingL = wingL;
        (bird as any)._wingR = wingR;
        (bird as any)._speed = 0.4 + Math.random() * 0.4;
        (bird as any)._flapSpeed = 8 + Math.random() * 4;
        birdsGroup.add(bird);
        birds.push(bird);
      }
      seaScene.add(birdsGroup);

      // Simple Ship
      shipGroup = new THREE.Group();
      const hull = new THREE.Mesh(
        new THREE.BoxGeometry(15, 3, 4),
        new THREE.MeshStandardMaterial({ color: 0x2a1d0d })
      );
      hull.position.y = 1.5;
      const sail = new THREE.Mesh(
        new THREE.ConeGeometry(4, 15, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      sail.position.y = 10;
      shipGroup.add(hull);
      shipGroup.add(sail);
      shipGroup.position.set(-200, 0, 0); // Brought closer
      seaScene.add(shipGroup);

      // Ambient light for ship
      const ambientLight = new THREE.AmbientLight(0x404040);
      seaScene.add(ambientLight);

      // Splash particles on the water surface
      const SPLASH_COUNT = 150;
      const splashGeo = new THREE.BufferGeometry();
      const splashPositions = new Float32Array(SPLASH_COUNT * 3);
      for (let i = 0; i < SPLASH_COUNT; i++) {
        splashPositions[i * 3] = (Math.random() - 0.5) * 400;
        splashPositions[i * 3 + 1] = 0.5; // just above water level
        splashPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
      splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPositions, 3));
      const splashMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5,
        transparent: true,
        opacity: 0.5
      });
      splashes = new THREE.Points(splashGeo, splashMat);
      splashes.visible = false;
      seaScene.add(splashes);

      window.addEventListener('resize', onSeaWindowResize);
      seaAnimate();
    }

    function onSeaWindowResize() {
      if(!seaCamera || !seaRenderer || !seaContainer) return;
      seaCamera.aspect = seaContainer.clientWidth / seaContainer.clientHeight;
      seaCamera.updateProjectionMatrix();
      seaRenderer.setSize(seaContainer.clientWidth, seaContainer.clientHeight);
    }

    function seaAnimate() {
      if (!isSeaActive) return;
      animationFrameId = requestAnimationFrame(seaAnimate);
      
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      // Time increment - Fixed roughly for 60fps
      seaTime += (1.0 / 60.0) * (window as any)._seaSpeed;
      
      if (water) {
        water.material.uniforms[ 'time' ].value += 1.0 / 60.0 * (window as any)._seaSpeed;
      }

      if ((window as any)._isDrifting) {
        seaCamera.position.y = 30 + Math.sin(seaTime * 2) * 2;
      } else {
        seaCamera.position.y = 30; // reset
      }

      if ((window as any)._rain && (window as any)._rain.visible) {
        // We're using DOM rain for visual droplets now as requested,
        // but we still animate splashes on the sea surface in WebGL!
        if ((window as any)._splashes) {
          (window as any)._splashes.visible = true;
          const positions = (window as any)._splashes.geometry.attributes.position.array;
          for (let i = 0; i < 150; i++) {
            if (Math.random() < 0.15) {
              positions[i * 3] = (Math.random() - 0.5) * 400;
              positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            }
          }
          (window as any)._splashes.geometry.attributes.position.needsUpdate = true;
        }
      } else {
        if ((window as any)._splashes) {
          (window as any)._splashes.visible = false;
        }
      }

      // Drift clouds
      if (clouds) {
        const positions = clouds.geometry.attributes.position.array;
        for (let i = 0; i < 15; i++) {
          positions[i*3] += 0.06 * (window as any)._seaSpeed;
          if (positions[i*3] > 400) {
            positions[i*3] = -400;
          }
        }
        clouds.geometry.attributes.position.needsUpdate = true;
      }

      // Flap birds wings and move them
      if (birds && birds.length > 0 && birdsGroup && birdsGroup.visible) {
        birds.forEach((bird) => {
          bird.position.x += bird._speed * (window as any)._seaSpeed;
          if (bird.position.x > 300) {
            bird.position.x = -300;
            bird.position.y = 45 + Math.random() * 25;
          }
          const flap = Math.sin(seaTime * bird._flapSpeed);
          bird._wingL.rotation.z = flap * 0.45;
          bird._wingR.rotation.z = -flap * 0.45;
        });
      }

      if (shipGroup) {
        shipGroup.position.x += 0.1 * (window as any)._seaSpeed;
        shipGroup.position.y = Math.sin(seaTime * 3) * 0.8;
        shipGroup.rotation.z = Math.sin(seaTime * 2) * 0.05;
        shipGroup.rotation.x = Math.sin(seaTime * 1.5) * 0.05;
        if (shipGroup.position.x > 200) {
          shipGroup.position.x = -200;
        }
      }

      // Lightning animation
      if ((window as any)._weather === 'RAIN' && Math.random() < 0.005) {
        (window as any)._lightningTime = now;
      }

      let currentExposure = (window as any)._baseExposure || 0.5;
      if ((window as any)._weather === 'RAIN' && (window as any)._lightningTime) {
        const elapsed = now - (window as any)._lightningTime;
        if (elapsed < 400) {
          // Double flash pattern
          if (elapsed < 60 || (elapsed > 120 && elapsed < 180)) {
            currentExposure += 2.0; // bright flash!
          }
        }
      }
      seaRenderer.toneMappingExposure = currentExposure;

      seaRenderer.render(seaScene, seaCamera);
    }

    (window as any)._seaSpeed = 1.0;
    (window as any)._isDrifting = true;
    (window as any)._weather = 'CLEAR';

    initSea();

    (window as any)._seaInstances = { seaRenderer, sky, water, sun, rain, shipGroup, seaScene, splashes, clouds, stars, moon, birdsGroup };

    return () => {
      isSeaActive = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onSeaWindowResize);
      if (seaRenderer && seaRenderer.domElement && seaContainer.contains(seaRenderer.domElement)) {
        seaContainer.removeChild(seaRenderer.domElement);
      }
    };
  }, []);

  // Update Sun when timeOfDay changes
  useEffect(() => {
    const inst = (window as any)._seaInstances;
    if (!inst) return;
    const val = timeOfDay;
    let elevation;
    let label = "DAY";
    
    if (val < 20) {
      elevation = -2; label = "NIGHT";
      (window as any)._baseExposure = 0.15;
      inst.water.material.uniforms['sunColor'].value.setHex(0xffffff); // Bright silver moonlight reflection
      inst.water.material.uniforms['waterColor'].value.setHex(0x000508);
      if (inst.stars) inst.stars.material.opacity = 0.0; // Hide WebGL stars, using DOM stars instead
      if (inst.moon) inst.moon.material.opacity = 0.95;
    } else if (val < 45) {
      elevation = 5 + (val-20); label = "MORNING";
      (window as any)._baseExposure = 0.3;
      inst.water.material.uniforms['sunColor'].value.setHex(0xffeebb);
      inst.water.material.uniforms['waterColor'].value.setHex(0x001e0f);
      if (inst.stars) inst.stars.material.opacity = 0.0;
      if (inst.moon) inst.moon.material.opacity = 0.0;
    } else if (val < 65) {
      elevation = 45; label = "MIDDAY";
      (window as any)._baseExposure = 0.5;
      inst.water.material.uniforms['sunColor'].value.setHex(0xffffff);
      inst.water.material.uniforms['waterColor'].value.setHex(0x001e0f);
      if (inst.stars) inst.stars.material.opacity = 0.0;
      if (inst.moon) inst.moon.material.opacity = 0.0;
    } else if (val < 85) {
      elevation = Math.max(0.5, 10 - (val-65)*0.5); label = "GOLDEN HOUR";
      (window as any)._baseExposure = 0.4;
      inst.water.material.uniforms['sunColor'].value.setHex(0xff8833);
      inst.water.material.uniforms['waterColor'].value.setHex(0x001e0f);
      if (inst.stars) inst.stars.material.opacity = 0.0;
      if (inst.moon) inst.moon.material.opacity = 0.0;
    } else {
      elevation = -1; label = "DUSK";
      (window as any)._baseExposure = 0.2;
      inst.water.material.uniforms['sunColor'].value.setHex(0x884422);
      inst.water.material.uniforms['waterColor'].value.setHex(0x000a12);
      if (inst.stars) inst.stars.material.opacity = 0.0;
      if (inst.moon) inst.moon.material.opacity = 0.0;
    }
    
    setTimeLabel(label);

    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(180);

    // If it's night, align reflection with the moon's direction instead of the sun
    if (val < 20) {
      const moonPhi = THREE.MathUtils.degToRad(90 - 30); // moon elevation 30
      inst.sun.setFromSphericalCoords(1, moonPhi, theta);
    } else {
      inst.sun.setFromSphericalCoords(1, phi, theta);
    }

    inst.sky.material.uniforms[ 'sunPosition' ].value.copy(inst.sun);
    inst.water.material.uniforms[ 'sunDirection' ].value.copy(inst.sun).normalize();
  }, [timeOfDay]);

  // Update Weather state
  useEffect(() => {
    const inst = (window as any)._seaInstances;
    if (!inst) return;
    (window as any)._weather = weather;
    if (weather === 'RAIN') {
      inst.rain.visible = true;
      inst.water.material.uniforms[ 'distortionScale' ].value = 6.0;
      (window as any)._seaSpeed = 1.8;
      inst.sky.material.uniforms[ 'turbidity' ].value = 25;
      inst.sky.material.uniforms[ 'rayleigh' ].value = 0.3; // dark grey sky
      inst.sky.material.uniforms[ 'mieCoefficient' ].value = 0.05;

      if (inst.seaScene && inst.seaScene.fog) {
        inst.seaScene.fog.color.setHex(0x0a0c10);
        inst.seaScene.fog.density = 0.005; // thicker storm fog
      }

      inst.water.material.uniforms['waterColor'].value.setHex(0x020408);
      inst.water.material.uniforms['sunColor'].value.setHex(0x333333); // dull grey reflection

      // Dark clouds in rain
      if (inst.clouds) {
        inst.clouds.material.color.setHex(0x222228);
        inst.clouds.material.opacity = 0.45;
      }

      // Hide birds during storm
      if (inst.birdsGroup) {
        inst.birdsGroup.visible = false;
      }
    } else {
      inst.rain.visible = false;
      inst.water.material.uniforms[ 'distortionScale' ].value = 3.7;
      (window as any)._seaSpeed = 1.0;
      inst.sky.material.uniforms[ 'turbidity' ].value = 10;
      inst.sky.material.uniforms[ 'rayleigh' ].value = 2;
      inst.sky.material.uniforms[ 'mieCoefficient' ].value = 0.005;

      if (inst.seaScene && inst.seaScene.fog) {
        inst.seaScene.fog.color.setHex(0x001e0f);
        inst.seaScene.fog.density = 0.001;
      }

      // Normal clouds
      if (inst.clouds) {
        inst.clouds.material.color.setHex(0xffffff);
        inst.clouds.material.opacity = 0.15;
      }

      // Show birds again
      if (inst.birdsGroup) {
        inst.birdsGroup.visible = true;
      }

      // Restore timeOfDay based sun/water colors
      setTimeOfDay(prev => prev + 0.0001);
    }
  }, [weather]);


  // Update Drifting
  useEffect(() => {
    (window as any)._isDrifting = drifting;
  }, [drifting]);

  // Live Clock & Sync
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      let val = 0;
      if (testTimeIndex === 0) {
        // Auto
        const hour = now.getHours();
        const minute = now.getMinutes();
        const second = now.getSeconds();
        val = (hour + minute / 60 + second / 3600) / 24 * 100;
      } else if (testTimeIndex === 1) val = 30; // Morning
      else if (testTimeIndex === 2) val = 55; // Midday
      else if (testTimeIndex === 3) val = 75; // Golden Hour
      else if (testTimeIndex === 4) val = 90; // Dusk
      else if (testTimeIndex === 5) val = 10; // Night
      
      setTimeOfDay(val);
    }, 1000);
    return () => clearInterval(timer);
  }, [testTimeIndex]);

  // Handle Quote display, transitions and auto-fading
  useEffect(() => {
    let title = 'I LOVE SUNSETS';
    let quote = '"Sunsets are proof that no matter what happens, every day can end beautifully."';

    if (weather === 'RAIN') {
      title = 'DANCING IN THE RAIN';
      quote = '"Some people feel the rain. Others just get wet."';
    } else {
      if (timeLabel === 'NIGHT') {
        title = 'STARRY NIGHT';
        quote = '"The stars are the street lights of eternity."';
      } else if (timeLabel === 'MORNING') {
        title = 'RISE AND SHINE';
        quote = '"Every morning brings new potential, but only if you choose to find it."';
      } else if (timeLabel === 'MIDDAY') {
        title = 'MIDDAY GLOW';
        quote = '"Keep your face to the sunshine and you cannot see a shadow."';
      } else if (timeLabel === 'DUSK') {
        title = 'DUSK SILENCE';
        quote = '"Dusk is just an illusion because the sun is either above the horizon or below it."';
      } else if (timeLabel === 'GOLDEN HOUR') {
        title = 'GOLDEN HOUR';
        quote = '"Sunsets are proof that no matter what happens, every day can end beautifully."';
      }
    }

    setQuoteTitle(title);
    setQuoteText(quote);
    setShowQuote(true);

    const timer = setTimeout(() => {
      setShowQuote(false);
    }, 6000); // Hide after 6 seconds

    return () => clearTimeout(timer);
  }, [timeLabel, weather]);

  return (
    <div className="relative w-full h-[100vh] z-[9] overflow-hidden pointer-events-none font-sans group">
      <style>{`
        .sea-ui {
          position: absolute;
          bottom: 15px;
          top: auto;
          left: 15px;
          width: 320px;
          background: rgba(30, 25, 30, 0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          color: rgba(255,255,255,0.9);
          pointer-events: auto;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          transform: scale(0.7);
          transform-origin: bottom left;
        }
        @media (min-width: 640px) {
          .sea-ui {
            padding: 24px;
            transform: scale(0.75);
            bottom: 30px;
          }
        }
        hr.rain-drop {
          width: 50px;
          border-color: transparent;
          border-right-color: rgba(171, 194, 233, 0.7);
          border-right-width: 50px;
          position: absolute;
          bottom: 100%;
          transform-origin: 100% 50%;
          animation-name: rain-animation;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          pointer-events: none;
          z-index: 5;
        }
        @keyframes rain-animation {
          from {
            transform: rotate(105deg) translateX(0);
          }
          to {
            transform: rotate(105deg) translateX(calc(100vh + 80px));
          }
        }
        .star {
          box-shadow: 0px 0px 4px 1.5px rgba(255, 255, 255, 0.8);
          position: absolute;
          width: 1.5px;
          height: 1.5px;
          border-radius: 50%;
          background-color: white;
          pointer-events: none;
          animation: twinkle-animation infinite alternate ease-in-out;
        }
        @keyframes twinkle-animation {
          0% {
            opacity: 0.15;
          }
          100% {
            opacity: 0.95;
          }
        }
      `}</style>
      
      <div ref={containerRef} className="absolute top-0 left-0 w-full h-full pointer-events-auto" />

      {/* DOM-based Rain Overlay */}
      {weather === 'RAIN' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {Array.from({ length: 130 }).map((_, i) => {
            const left = Math.random() * 130 - 15;
            const duration = 0.45 + Math.random() * 0.45;
            const delay = Math.random() * -5; // negative delay to pre-scatter the drops
            return (
              <hr
                key={i}
                className="rain-drop"
                style={{
                  left: `${left}%`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`
                }}
              />
            );
          })}
        </div>
      )}

      {/* DOM-based Twinkling Starfield Overlay */}
      {timeLabel === 'NIGHT' && weather === 'CLEAR' && (
        <div id="stars" className="absolute inset-0 overflow-hidden pointer-events-none z-[4]">
          {Array.from({ length: 200 }).map((_, i) => {
            const top = Math.random() * 65; // keep in upper sky
            const left = Math.random() * 100;
            const duration = 0.8 + Math.random() * 1.2;
            const delay = Math.random() * -5;
            return (
              <figure
                key={i}
                className="star"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`
                }}
              />
            );
          })}
        </div>
      )}
      
      {/* Text Overlay */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10 px-4 transition-all duration-1000"
        style={{ 
          opacity: showQuote ? 1 : 0, 
          transform: showQuote ? 'translateY(0)' : 'translateY(-25px)' 
        }}
      >
        <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-white/90 font-orbitron tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] mb-6">
          {quoteTitle}
        </h2>
        <p className="text-sm md:text-lg lg:text-xl font-mono text-white/80 max-w-2xl leading-relaxed tracking-wide drop-shadow-md">
          {quoteText}
        </p>
      </div>
      
      <div className="sea-ui">
        <div className="text-[9px] tracking-[3px] text-white/50 mb-1.5 uppercase font-semibold">Realtime Ocean</div>
        <div className="text-2xl font-bold tracking-[2px] mb-1.5">OPEN SEA</div>
        <div className="text-[11px] text-white/40 mb-6 font-mono tracking-wide">Gerstner swell · FBM micro-surface</div>

        <div className="mb-5 flex gap-2">
          <button 
            onClick={() => setTestTimeIndex((prev) => (prev + 1) % 6)}
            className="flex-1 px-3 py-2 rounded-md text-[10px] tracking-[1.5px] uppercase font-semibold transition-all border border-[#7fffd4]/30 text-[#7fffd4] hover:bg-[#7fffd4]/10"
          >
            Time: {testTimeIndex === 0 ? 'AUTO' : testTimeIndex === 1 ? 'MORNING' : testTimeIndex === 2 ? 'MIDDAY' : testTimeIndex === 3 ? 'GOLDEN' : testTimeIndex === 4 ? 'DUSK' : 'NIGHT'}
          </button>
          <button 
            onClick={() => setWeather(weather === 'CLEAR' ? 'RAIN' : 'CLEAR')}
            className="flex-1 px-3 py-2 rounded-md text-[10px] tracking-[1.5px] uppercase font-semibold transition-all border border-[#7fffd4]/30 text-[#7fffd4] hover:bg-[#7fffd4]/10"
          >
            Weather: {weather}
          </button>
        </div>

        <div className="mb-5">
          <div className="flex justify-between text-[10px] mb-1 tracking-[2px] text-white/60 uppercase font-semibold">
            <span>Local Time</span>
            <span className="text-[#7fffd4] font-bold">{timeLabel}</span>
          </div>
          <div className="text-3xl font-black font-orbitron tracking-widest text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {currentTime.toLocaleTimeString([], { hour12: false })}
          </div>
          <div className="h-0.5 w-full bg-white/10 mt-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#7fffd4] shadow-[0_0_10px_rgba(127,255,212,0.8)] transition-all duration-1000"
              style={{ width: `${timeOfDay}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <button 
            className="px-4 py-1.5 rounded-full text-[10px] tracking-[1.5px] uppercase font-semibold transition-all border border-[#7fffd4]/30 text-[#7fffd4]"
            style={{ background: drifting ? 'rgba(127,255,212,0.2)' : 'rgba(255,255,255,0.05)' }}
            onClick={() => setDrifting(!drifting)}
          >
            Drift
          </button>
          <span className="text-[10px] text-white/40 font-mono tracking-wider">
            <span className="text-white/70">{fps}</span> FPS
          </span>
        </div>
      </div>
    </div>
  );
};
