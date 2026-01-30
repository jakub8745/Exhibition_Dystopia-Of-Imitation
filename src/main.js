import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { obrazyArray } from "./arrays.js";
    const newPositon = new THREE.Vector3();
    const pickPosition = new THREE.Vector2();
    const NO_PICK = -100000;
    const distance = new THREE.Vector3();
    const front_vector = new THREE.Vector3();
    const right_vector = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const ignore1 = new THREE.Vector3();
    const ignore2 = new THREE.Vector3();
    const bezruch = true
    const d = 0.1;
    let isTweenCompleted = true;
    let x, INTERSECTED, INTERSECTED0;
    let clickTimer = null;
    let whatTouch = 0;

    let control, orbit;
    const targetStart = new THREE.Vector3();
    const targetEnd = new THREE.Vector3();
    const cameraStart = new THREE.Vector3();
    const cameraEnd = new THREE.Vector3();
    const prevCameraPos = new THREE.Vector3();
    const prevTarget = new THREE.Vector3();

    const mobileFirstTouch = true;
    const walkSpeed = 2.5;
    const joystickVector = new THREE.Vector2();
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let prevTime = performance.now();


    const getDeviceType = () => {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
      }
      if (
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 0) ||
        navigator.platform === "iPad"
      ) {
        return "tablet";
      }
      if (
        /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
          ua
        )
      ) {
        return "mobile";
      }
      return "desktop";
    };

    const deviceType = getDeviceType();
    if (deviceType === 'mobile') {
      document.getElementById('button-container').style.height = "80vh";
    }
    if (deviceType === "mobile" || deviceType === "tablet") {
      const joystick = document.getElementById("joystick");
      const joystickBase = joystick.querySelector(".joystick-base");
      const joystickStick = joystick.querySelector(".joystick-stick");
      joystick.style.display = "block";

      const maxRadius = 50;
      let joystickActive = false;
      let baseCenter = { x: 0, y: 0 };

      const updateStick = (x, y) => {
        const dx = x - baseCenter.x;
        const dy = y - baseCenter.y;
        const dist = Math.hypot(dx, dy);
        const clamped = Math.min(dist, maxRadius);
        const angle = Math.atan2(dy, dx);
        const offsetX = Math.cos(angle) * clamped;
        const offsetY = Math.sin(angle) * clamped;
        joystickStick.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        joystickVector.set(offsetX / maxRadius, offsetY / maxRadius);
      };

      const resetStick = () => {
        joystickStick.style.transform = "translate(0, 0)";
        joystickVector.set(0, 0);
      };

      const onPointerDown = (event) => {
        event.preventDefault();
        joystickActive = true;
        const rect = joystickBase.getBoundingClientRect();
        baseCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        updateStick(event.clientX, event.clientY);
      };

      const onPointerMove = (event) => {
        if (!joystickActive) return;
        event.preventDefault();
        updateStick(event.clientX, event.clientY);
      };

      const onPointerUp = (event) => {
        if (!joystickActive) return;
        event.preventDefault();
        joystickActive = false;
        resetStick();
      };

      joystick.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    }

    const counterDownTimer = () => {
      const countDownDate = new Date("May 27, 2022 18:00:00").getTime();
      const now = new Date().getTime();
      const initialDistance = countDownDate - now;
      if (initialDistance <= 0) {
        document.getElementById("nowyCounterDown").innerHTML = "Loading...";
        document.getElementById("button-container").style.display = "inline-flex";
        main();
        return;
      }

      // Update the count down every 1 second
      const x = setInterval(function () {
        const now = new Date().getTime();
        const distanceCDT = countDownDate - now;

        const days = Math.floor(distanceCDT / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distanceCDT % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distanceCDT % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distanceCDT % (1000 * 60)) / 1000);

        document.getElementById("nowyCounterDown").innerHTML = '<p> <img class="logo" src="/textures/BluePointGallery.gif" alt="LogoBluePointArtGallery"   /><br><b><i> Jarek Solecki </i>THE DYSTOPIA OF AN IMITATION</b><br> <a href="https://bluepointart.uk/">BLUE POINT ART GALLERY</a><br />Londyn 2022<br /><br/><b>Exhibition opens in: <br> ' + days + ' days ' + hours + " hours " + minutes + " minutes " + seconds + " seconds.";
        if (distanceCDT < 0) {
          clearInterval(x);
          document.getElementById("nowyCounterDown").innerHTML = "Loading...";
          document.getElementById("button-container").style.display = "inline-flex";
          main();
        }
      }, 1000);
    }
    counterDownTimer()



    function main() {
	    
	 if (window.location !== window.parent.location) {
		document.getElementById("button-container").style.display = "none"
      } else {
//
      }    
	    
      const canvas = document.querySelector("#c");
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      const raycaster = new THREE.Raycaster();
      const scene = new THREE.Scene();
      const cameraWorldDir = new THREE.Vector3();
      const camera = new THREE.PerspectiveCamera(
        60, // fov
        2, // aspect
        0.01, // near
        70// far
      );

      scene.background = new THREE.Color(0xf0f0f0);
      scene.add(camera);

      const maxPixelRatio = deviceType === "desktop" ? 1.5 : 1.0;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));

      renderer.shadowMap.enabled = true;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.physicallyCorrectLights = true
      renderer.toneMapping = THREE.CineonToneMapping

      const colliders = [];
      const cameraCollider = new THREE.Sphere(new THREE.Vector3(), 0.25);

      const isColliderMesh = (mesh) => {
        if (!mesh || !mesh.isMesh) return false;
        if (mesh.name === "Floor") return false;
        if (mesh.name === "Sill") return false;
        if (mesh.name === "BouncingSphere") return false;
        if (mesh.name === "TargetBouncingSphere") return false;
        if (mesh.name === "dzban") return true;
        if (mesh.name === "Wall" || mesh.name.includes("Wall")) return true;
        return false;
      };

      const buildColliders = () => {
        colliders.length = 0;
        scene.traverse((obj) => {
          if (!isColliderMesh(obj)) return;
          if (!obj.geometry.boundingBox) {
            obj.geometry.computeBoundingBox();
          }
          colliders.push(obj);
        });
      };

      const hasCollision = () => {
        if (colliders.length === 0) return false;
        cameraCollider.center.copy(camera.position);
        for (const mesh of colliders) {
          if (!mesh.geometry.boundingBox) continue;
          const worldBox = mesh.geometry.boundingBox.clone();
          worldBox.applyMatrix4(mesh.matrixWorld);
          if (worldBox.intersectsSphere(cameraCollider)) {
            return true;
          }
        }
        return false;
      };

      const setupMovementModal = () => {
        if (window.location !== window.parent.location) {
          return;
        }
        const modal = document.getElementById("movement-modal");
        if (!modal) return;
        const closeButton = modal.querySelector(".modal-close");
        const storageKey = "movementHelpSeen";

        const hide = () => {
          modal.classList.remove("is-visible");
          modal.setAttribute("aria-hidden", "true");
          try {
            localStorage.setItem(storageKey, "1");
          } catch (err) {
            // ignore storage errors
          }
        };

        const show = () => {
          modal.classList.add("is-visible");
          modal.setAttribute("aria-hidden", "false");
        };

        const seen = (() => {
          try {
            return localStorage.getItem(storageKey) === "1";
          } catch (err) {
            return false;
          }
        })();

        if (!seen) {
          show();
        }

        closeButton?.addEventListener("click", (evt) => {
          evt.preventDefault();
          hide();
        });
        modal.addEventListener("click", (evt) => {
          if (evt.target === modal) {
            hide();
          }
        });
        window.addEventListener("keydown", (evt) => {
          if (evt.key === "Escape" && modal.classList.contains("is-visible")) {
            hide();
          }
        });
      };


      const openGestures = (iframeSrc, isNotWeb) => {
        if (document.getElementsByTagName("iframe")[0].contentWindow !== undefined) {
          document.getElementById("widget").style.display = "flex";
          document.getElementsByTagName("iframe")[0].src = iframeSrc
        }
        if (isNotWeb) { counterDownTimer(); }


        switch (deviceType) {
          case "desktop":
            break;
          case "mobile":
            break;
          case 'tablet':
            break;
          default:
            break;
        }
      };



      /////////objcts - world///////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////

      {
        const loadingManager = new THREE.LoadingManager(() => {
          const loadingScreen = document.getElementById("loading-screen");
          loadingScreen.classList.add("fade-out");
          // optional: remove loader from DOM via event listener
          loadingScreen.addEventListener("transitionend", onTransitionEnd);
        });

        const loadero = new THREE.ObjectLoader(loadingManager);

        loadero.load("/Pitcher.json", function (objec) {
          scene.copy(objec);
          scene.children.forEach((element) => {
            if (element.type === "Mesh") {
              element.geometry.computeBoundingBox();
            }
          })

          const dzban = scene.getObjectByName(`dzban`);

          dzban.rotation.set(0, -90, 0)
          dzban.receiveShadow = true
          dzban.material.needsUpdate = true

          control._gizmo.visible = false;
          control.setMode("rotate");
          control.attach(dzban);
          scene.add(control);

          const floor = scene.getObjectByName('Floor');
          floor.material.receiveShadow = true
          floor.material.map.wrapS = THREE.RepeatWrapping;
          floor.material.map.wrapT = THREE.RepeatWrapping;
          floor.material.map.repeat.set(60, 60);
          floor.material.needsUpdate = true;
          buildColliders();
        })
      }
      ////////////////////////////////////////
      // CONTROLS


      const controls = new OrbitControls(camera, renderer.domElement);
      control = new TransformControls(camera, renderer.domElement);

      switch (deviceType) {
        case "desktop":
          //openGestures();
          controls.mouseButtons = {
            RIGHT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            LEFT: THREE.MOUSE.ROTATE
          };
          // Keep keyboard for walk controls, not OrbitControls panning.
          controls.keyPanSpeed = 40;

          controls.screenSpacePanning = false;
          controls.minDistance = 0.1;
          controls.maxDistance = 2.5;
          controls.enablePan = true;
          //controls.panSpeed = 5;
          //controls.rotateSpeed = 0.2;
          controls.enableZoom = true;
          controls.zoomSpeed = 1;
          //controls.minZoom = 1;
          //controls.minZoom = 1;
          controls.panSpeed = 4;
          controls.rotateSpeed = 0.4;
          break;
        case "mobile":

          controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
          };
          controls.screenSpacePanning = false;
          controls.minDistance = 0;
          controls.maxDistance = 2.5;
          controls.panSpeed = 2;
          controls.rotateSpeed = 1;
          controls.enableZoom = true;
          controls.zoomSpeed = 1.5;
          break;
        case "tablet":

          controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
          };
          controls.screenSpacePanning = false;
          controls.minDistance = 0;
          controls.maxDistance = 2.5;
          controls.panSpeed = 2;
          controls.rotateSpeed = 1;
          controls.enableZoom = true;
          controls.zoomSpeed = 1.5;
      }

      controls.maxPolarAngle = Math.PI / 2; // Limit angle of visibility
      controls.minPolarAngle = Math.PI / 2;
      controls.target.copy(new THREE.Vector3(-19, 6, 2.5));
      controls.object.position.copy(new THREE.Vector3(-21, 6, 2));
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.02;
      controls.saveState();
      setupMovementModal();

      //////////////////// audio: PouringMilk


      const dzwieki = () => {

        const listener = new THREE.AudioListener();
        camera.add(listener);
        const sound = new THREE.PositionalAudio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('sounds/Pouring_Milk_Sound_Effect.mp3', function (buffer) {
          sound.name = "pouringMilk"
          sound.setBuffer(buffer);
          sound.setLoop(true);
          sound.setRefDistance(.2);
          sound.setVolume(25);

          if (scene.getObjectByName(`dzban`)) {
            scene.getObjectByName(`dzban`).add(sound);
          }
        })

        //////////////////// audio: kitchen_sounds

        const geometryDot = new THREE.SphereBufferGeometry(0.25, 8, 8); //0.5
        const materialDot = new THREE.MeshBasicMaterial({
          color: 0x010101,
          wireframe: true
        });
        const dot = new THREE.Mesh(geometryDot, materialDot);
        dot.position.set(-7.6, 7, 18);
        dot.name = "dot"
        dot.material.visible = false;
        scene.add(dot)
        const listenerOnPoint = new THREE.AudioListener();
        camera.add(listenerOnPoint);
        const soundOnPoint = new THREE.PositionalAudio(listenerOnPoint);
        const audioLoaderOnPoint = new THREE.AudioLoader();
        audioLoaderOnPoint.load('sounds/kitchen_sounds.mp3', function (buffer) {
          soundOnPoint.name = "kitchenSounds"
          soundOnPoint.setBuffer(buffer);
          soundOnPoint.setLoop(true);
          soundOnPoint.setRefDistance(.2);
          soundOnPoint.setVolume(20);

          if (scene.getObjectByName(`dot`)) {
            scene.getObjectByName(`dot`).add(soundOnPoint);
          }
        });


      }
      /////////////////////////// if audio button 
      //console.log(deviceType)
      if (deviceType !== "mobile") {

        dzwieki()
      }

      const soundOn = () => {
        // console.log("hgvhjv")

        if (scene.getObjectByName('pouringMilk') && scene.getObjectByName('kitchenSounds')) {
          const onSoundPouring = scene.getObjectByName('pouringMilk')
          const onSoundDot = scene.getObjectByName('kitchenSounds')
          if (onSoundPouring.isPlaying) {
            document.getElementById('play-icon').src = "/textures/icons/audioMuted.png";
            onSoundPouring.pause();
            onSoundDot.pause()

          }
          else {
            onSoundPouring.play();
            onSoundDot.play()
            document.getElementById('play-icon').src = "/textures/icons/audioButton.png";

          }
        }

      }


      const handleMobilesoundOn = (evt) => {

        // if (mobileFirstTouch) {
        evt.preventDefault();
        //   alert("cedsvsd")
        document.getElementById("play").removeEventListener("touchstart", handleMobilesoundOn);
        //const mobileFirstTouch = false

        document.getElementById("play").addEventListener("touchstart", (evt) => { evt.preventDefault(); soundOn() });
        dzwieki();


        //}

      }
     

      ////////////////////  Camera Bouncing Sphere
      const geometry = new THREE.SphereBufferGeometry(0.25, 8, 8); //0.5
      const material = new THREE.MeshBasicMaterial({
        color: 0x010101,
        wireframe: true
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.rotation.x = Math.PI / 2;
      plane.position.copy(camera.position);
      plane.material.visible = false;
      plane.name = "BouncingSphere";
      plane.geometry.computeBoundingSphere();
      scene.add(plane);

      /////////////////// Target Bouncing Sphere

      const Tgeometry = new THREE.SphereBufferGeometry(0.21, 8, 8); //0.21
      const Tmaterial = new THREE.MeshBasicMaterial({
        color: 0x011000,
        wireframe: true
      });
      const Tplane = new THREE.Mesh(Tgeometry, Tmaterial);
      Tplane.rotation.x = Math.PI / 2;
      Tplane.position.copy(controls.target);
      Tplane.material.visible = false;
      Tplane.name = "TargetBouncingSphere";
      Tplane.geometry.computeBoundingSphere();
      scene.add(Tplane);
      /////////////////////////////////////

      const setPickPosition = (event) => {
        let pos = getCanvasRelativePosition(event);
        pickPosition.x = (pos.x / renderer.domElement.clientWidth) * 2 - 1;
        pickPosition.y = (pos.y / renderer.domElement.clientHeight) * -2 + 1; // note we flip Y

        touchStart();
      };

      const clearPickPosition = () => {
        pickPosition.x = NO_PICK;
        pickPosition.y = NO_PICK;
      };

      // event listeners

      ////////////// audio button 
      document.getElementById("play").addEventListener("touchstart", handleMobilesoundOn);
      document.getElementById("play").addEventListener("click", (evt) => { evt.preventDefault(); soundOn() });

    
      document
        .getElementById("infoButton")
        .addEventListener("pointerdown", (evt) => {
          evt.preventDefault();
          openGestures("project_info.html", false)

        });
      document
        .getElementById("infoButton")
        .addEventListener("touchstart", (evt) => {
          evt.preventDefault();
          openGestures("project_info.html", false)

        });

      document.getElementById("gizmoButton").addEventListener("pointerdown", (evt) => { evt.preventDefault(); control._gizmo.visible = !control._gizmo.visible })
      document.getElementById("galleryLogoButton").addEventListener("pointerdown", (evt) => { evt.preventDefault(); window.location.assign('https://bluepointart.uk/the-dystopia-of-an-imitation'); })
      document.getElementById("pdfButton").addEventListener("pointerdown", (evt) => { evt.preventDefault(); window.open('https://zenodo.org/record/6633680/files/Dystopia-of-an-Imitation-%20Solecki-Gorzkowicz%20%28ed%29.pdf?download=1', '_blank', 'noopener'); })
      document.getElementById("openseaButton").addEventListener("pointerdown", function (evt) { evt.preventDefault(); window.open('https://opensea.io/collection/dystopiaofimitation', '_blank', 'noopener'); })
      document.getElementById("cryptoVoxelsButton").addEventListener("pointerdown", function (evt) { evt.preventDefault(); window.open('https://www.voxels.com/play?coords=E@1807W,979S', '_blank', 'noopener'); })

	    
      window.addEventListener("click", setPickPosition);
      window.addEventListener("mouseout", clearPickPosition);
      window.addEventListener("mouseleave", clearPickPosition);
      window.addEventListener(
        "touchstart",
        (event) => {
          event.preventDefault();
          setPickPosition(event.touches[0]);
        },
        { passive: false }
      );

      window.addEventListener("touchmove", (event) => {
        setPickPosition(event.touches[0]);
      });

      window.addEventListener("touchend", clearPickPosition);

      controls.addEventListener("end", function () {
        if (
          document.getElementById("widget").style.display !== "none" &&
          isTweenCompleted === true
        ) {
          window.TimeoutID = setTimeout(() => {
            document.getElementById("widget").style.display = "none";
          }, 1000);
        }
      });


      ////////////

      control.addEventListener("dragging-changed", function (event) {
        controls.enabled = !event.value;
      });
      ///////

      window.addEventListener("keydown", function (event) {
        if (deviceType === "desktop") {
          switch (event.code) {
            case "ArrowUp":
            case "KeyW":
              moveForward = true;
              break;
            case "ArrowLeft":
            case "KeyA":
              moveLeft = true;
              break;
            case "ArrowDown":
            case "KeyS":
              moveBackward = true;
              break;
            case "ArrowRight":
            case "KeyD":
              moveRight = true;
              break;
            default:
              break;
          }
        }
        switch (event.keyCode) {
          case 77: // M -- move
            control.setMode("translate");
            break;

          case 82: // R --- rotatemrr
            control.setMode("rotate");
            break;

          case 88: // X
            control.showX = !control.showX;
            break;

          case 89: // Y
            control.showY = !control.showY;
            break;

          case 90: // Z
            control.showZ = !control.showZ;
            break;

          case 32: // Spacebar
            //control.enabled = !control.enabled;
            control._gizmo.visible = !control._gizmo.visible
            break;

          case 27: // Esc
            control.reset();
            break;
        }
      });
      window.addEventListener("keyup", function (event) {
        if (deviceType !== "desktop") {
          return;
        }
        switch (event.code) {
          case "ArrowUp":
          case "KeyW":
            moveForward = false;
            break;
          case "ArrowLeft":
          case "KeyA":
            moveLeft = false;
            break;
          case "ArrowDown":
          case "KeyS":
            moveBackward = false;
            break;
          case "ArrowRight":
          case "KeyD":
            moveRight = false;
            break;
          default:
            break;
        }
      });


      ///////

      // cheking double tap
      const touchStart = () => {
        if (deviceType === "mobile" || deviceType === "tablet") {
          return null;
        }



        if (clickTimer == null) {
          ///////////////////////////// now it is cheking for double click:
          clickTimer = setTimeout(function () {
            clickTimer = null;
            whatTouch = 1;
          }, 500);
        } else {
          clearTimeout(clickTimer);
          clickTimer = null;
          whatTouch = 2;
        }
      };
      const callback = () => {
       // console.log("camera.position", camera.position)
      }


      //////////////////////////////////////////////////////////////////////////////////


      const makeInfoDOM = (artObject) => {
       //console.log("artObject.userData", artObject.userData)
        if (artObject.userData.distanceToObject === undefined) {
          return false;
        }



        const artObjectWorldDirection = new THREE.Vector3();
        artObject.getWorldDirection(artObjectWorldDirection);
        artObjectWorldDirection.round()

        TWEEN.removeAll();

        targetStart.copy(controls.target);
        targetEnd.copy(artObject.position);
        targetEnd.y = controls.target.y;

        cameraStart.copy(camera.position);
        cameraEnd.copy(artObject.position);
        cameraEnd.y = camera.position.y;

        distance.set(artObject.userData.distanceToObject, 0, artObject.userData.distanceToObject);
        cameraEnd.add(artObjectWorldDirection.multiply(distance));
        distance.set(artObject.userData.targetToObject, 0, artObject.userData.targetToObject);
        targetEnd.add(artObjectWorldDirection.multiply(distance));

        isTweenCompleted = false;
        const tweenTarget = new TWEEN.Tween(targetStart).to(targetEnd, 2000).easing(TWEEN.Easing.Quadratic.Out);
        tweenTarget.onUpdate(function () {
          controls.target.copy(targetStart);
        });
        tweenTarget.onComplete(function () {
          isTweenCompleted = true;
        });
        tweenTarget.start();

        const tweenCamera = new TWEEN.Tween(cameraStart).to(cameraEnd, 2000).easing(TWEEN.Easing.Quadratic.Out);
        tweenCamera.onUpdate(function () {
          camera.position.x = cameraStart.x;
          camera.position.z = cameraStart.z;
        });
        tweenCamera.start();

        return true;
      };

      const makeFeedback = (paintName) => { };
      const getCanvasRelativePosition = (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      };
      {
        //////////   RENDEROWANIE
      }

      function onWindowResize() {
        if (resizeRendererToDisplaySize(renderer)) {
          clearPickPosition();
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }
      }

      const resizeRendererToDisplaySize = (renderer) => {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = (canvas.clientWidth * pixelRatio) | 0; // przelicznie służy tylko do sprawdzenia czy size się zmienił.
        const height = (canvas.clientHeight * pixelRatio) | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
          renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); // było: renderer.setSize(width, height, false);
          renderer.setPixelRatio(pixelRatio); // DODANE!!!!
          clearPickPosition();
        }
        return needResize;
      };

      const render = () => {
        prevCameraPos.copy(camera.position);
        prevTarget.copy(controls.target);

        if (resizeRendererToDisplaySize(renderer)) {
          clearPickPosition();
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();

        }
        ///////////////////////////////////////

        if (deviceType === "desktop") {
          const time = performance.now();
          const delta = (time - prevTime) / 1000;
          if (moveForward || moveBackward || moveLeft || moveRight) {
            camera.getWorldDirection(front_vector);
            front_vector.y = 0;
            front_vector.normalize();
            right_vector.crossVectors(front_vector, camera.up).normalize();
            direction.set(0, 0, 0);
            if (moveForward) direction.add(front_vector);
            if (moveBackward) direction.sub(front_vector);
            if (moveRight) direction.add(right_vector);
            if (moveLeft) direction.sub(right_vector);
            if (direction.lengthSq() > 0) {
              direction.normalize();
              camera.position.addScaledVector(direction, walkSpeed * delta);
              controls.target.addScaledVector(direction, walkSpeed * delta);
            }
          }
          prevTime = time;
        }
        if (deviceType === "mobile" || deviceType === "tablet") {
          const time = performance.now();
          const delta = (time - prevTime) / 1000;
          if (joystickVector.lengthSq() > 0) {
            camera.getWorldDirection(front_vector);
            front_vector.y = 0;
            front_vector.normalize();
            right_vector.crossVectors(front_vector, camera.up).normalize();
            direction.set(0, 0, 0);
            direction.addScaledVector(front_vector, -joystickVector.y);
            direction.addScaledVector(right_vector, joystickVector.x);
            if (direction.lengthSq() > 0) {
              direction.normalize();
              camera.position.addScaledVector(direction, walkSpeed * delta);
              controls.target.addScaledVector(direction, walkSpeed * delta);
            }
          }
          prevTime = time;
        }

        if (clickTimer == null) {
          //
        }

        if (hasCollision()) {
          camera.position.copy(prevCameraPos);
          controls.target.copy(prevTarget);
        }
        //});

        ///////////////////////////////// CLICK & collision & info
        const obj = scene.children.find((obj) => obj.name == "BouncingSphere");
        newPositon.copy(controls.target);
        newPositon.y = 0.5;
        obj.position.copy(newPositon);

        if (pickPosition.x !== NO_PICK || pickPosition.y !== NO_PICK) {
          raycaster.setFromCamera(pickPosition, camera);
          const intersects = raycaster.intersectObjects(scene.children);
          if (intersects.length > 0) {
            if (INTERSECTED != intersects[0].object) {
              INTERSECTED = intersects[0].object;

              switch (INTERSECTED.name) {
                case "TargetBouncingSphere":
                  INTERSECTED = INTERSECTED0;

                  break;
                default:
                  INTERSECTED0 = INTERSECTED;
              }

              if (
                INTERSECTED.name != "BouncingSphere" &&
                INTERSECTED.name != "TargetBouncingSphere" &&
                INTERSECTED.name != "Sill" &&
                INTERSECTED.name != "Floor" &&
                INTERSECTED.name != "Wall" &&
                INTERSECTED.name != "DirectionalLight"
              ) {
                if (INTERSECTED.children[0]) {
                  //console.log('INTERSECTED.children[0]', INTERSECTED.children[0].name);
                }
                clickFeedback(INTERSECTED);

                switch (whatTouch) {
                  case 1:

                    //
                    break;
                  case 2:

                    makeInfoDOM(INTERSECTED);
                    document.getElementById('widget').style.display = "none";


                    break;
                  default:
                    INTERSECTED = null;
                }
              }
            }
          }
        }

        whatTouch = 0;
        INTERSECTED = null;
        window.clearTimeout(window.timeoutID);
        clearPickPosition();
        controls.update();
        TWEEN.update();

        if (scene.children.length >= 1) {
          renderer.render(scene, camera);
        }


        //////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////

        requestAnimationFrame(render);
      };

      requestAnimationFrame(render);
    }
    {
      //////////////////////  KONIEC MAIN()
    }

    function detectCollisionCubes(object1, object2) {
      object1.updateMatrixWorld();
      object2.updateMatrixWorld();

      let box1 = object1.geometry.boundingSphere.clone();
      box1.applyMatrix4(object1.matrixWorld);

      let box2 = object2.geometry.boundingBox.clone();
      box2.applyMatrix4(object2.matrixWorld);
      return box1.intersectsBox(box2);
    }

    function onTransitionEnd(event) {
      const element = event.target;
      element.remove();
    }

    const clickFeedback = (intersectedObject) => {
      if (intersectedObject.children[0]) {

        /////////////// change colour for intersectedObject

        intersectedObject.material.color.addScalar(0.4);
        const func = () => {
          intersectedObject.material.color.setRGB(1, 1, 1);
        };
        setTimeout(func, 100);
      }
    };
