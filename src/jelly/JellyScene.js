import * as THREE from 'three';
import { SoftBodyObject } from './softBody.js';
import {
  LIMITS,
  buildJellyGroup,
  clipProfile,
  createObjectState,
  disposeGroup,
  profileCentroid,
} from './geometry.js';

const CAMERA_PRESETS = {
  front: { theta: 0, phi: 0.02, radius: 5.8 },
  threeQuarter: { theta: 0.72, phi: 0.18, radius: 6.2 },
  side: { theta: 1.45, phi: 0.08, radius: 6.4 },
};

const noop = () => {};

export function createJellyScene(canvas, callbacks = {}) {
  return new JellyScene(canvas, callbacks);
}

class JellyScene {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.callbacks = {
      onObjectsChange: callbacks.onObjectsChange ?? noop,
      onMenu: callbacks.onMenu ?? noop,
      onNotice: callbacks.onNotice ?? noop,
      onStroke: callbacks.onStroke ?? noop,
      onGpuStatus: callbacks.onGpuStatus ?? noop,
    };
    this.objects = new Map();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.clock = new THREE.Clock();
    this.activePointers = new Map();
    this.dragState = null;
    this.tool = 'hand';
    this.paused = false;
    this.slowMotion = false;
    this.stacked = false;
    this.qualityReduced = false;
    this.settings = { firmness: 0.72, damping: 0.58 };
    this.cameraState = { ...CAMERA_PRESETS.front, target: new THREE.Vector3(0, 0, 0) };
    this.resizeObserver = null;
    this.animationFrame = 0;

    if (!hasWebGL(canvas)) {
      this.callbacks.onGpuStatus({ supported: false });
      return;
    }

    this.callbacks.onGpuStatus({ supported: true });
    this.createRenderer();
    this.createWorld();
    this.bindEvents();
    this.addObject('pear', { position: new THREE.Vector3(0, 0, 0) });
    this.animate();
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    this.updateSize();
    this.updateCamera();
  }

  createWorld() {
    const ambient = new THREE.HemisphereLight(0xfff7ea, 0xc8bea9, 2.1);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 3.4);
    key.position.set(-2.2, 3.6, 5.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xffead4, 1.1);
    fill.position.set(2.2, -2.4, 3.5);
    this.scene.add(fill);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 5),
      new THREE.ShadowMaterial({ color: 0x4b4238, opacity: 0.12, transparent: true }),
    );
    shadow.position.set(0, -0.02, -0.48);
    shadow.receiveShadow = true;
    this.scene.add(shadow);
    this.shadowPlane = shadow;
  }

  bindEvents() {
    this.handlePointerDown = (event) => this.onPointerDown(event);
    this.handlePointerMove = (event) => this.onPointerMove(event);
    this.handlePointerUp = (event) => this.onPointerUp(event);
    this.handleWheel = (event) => this.onWheel(event);
    this.handleResize = () => {
      this.updateSize();
      this.frameScene();
    };

    this.canvas.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
    window.addEventListener('pointermove', this.handlePointerMove, { passive: false });
    window.addEventListener('pointerup', this.handlePointerUp, { passive: false });
    window.addEventListener('pointercancel', this.handlePointerUp, { passive: false });
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    window.addEventListener('resize', this.handleResize);
  }

  addObject(type, overrides = {}) {
    if (!this.renderer) return null;
    if (this.objects.size >= LIMITS.maxObjects) {
      this.callbacks.onNotice(`Scene limit reached (${LIMITS.maxObjects} jelly objects). Remove one before adding more.`);
      return null;
    }

    const state = createObjectState(type, {
      ...overrides,
      position: overrides.position ?? this.nextPlacement(),
    });
    const built = buildJellyGroup(state);
    const softBody = new SoftBodyObject(state, built);
    this.objects.set(state.id, softBody);
    this.scene.add(softBody.group);
    this.updateStackLayout();
    this.frameScene();
    this.emitObjects();
    return state.id;
  }

  duplicateObject(id) {
    const source = this.objects.get(id);
    if (!source) return;
    const offset = new THREE.Vector3(0.44 + source.bounds.radius * 0.32, -0.28, 0.02);
    this.addObject(source.state.type, {
      profile: source.state.profile.map((point) => ({ ...point })),
      scale: source.state.scale,
      thickness: source.state.thickness,
      colors: { ...source.state.colors },
      piece: source.state.piece,
      position: source.group.position.clone().add(offset),
    });
  }

  removeObject(id) {
    const object = this.objects.get(id);
    if (!object) return;
    if (this.dragState?.object === object) this.dragState = null;
    this.scene.remove(object.group);
    disposeGroup(object.group);
    this.objects.delete(id);
    if (this.objects.size === 0) {
      this.addObject('pear', { position: new THREE.Vector3(0, 0, 0) });
      return;
    }
    this.updateStackLayout();
    this.frameScene();
    this.emitObjects();
  }

  recolorObject(id, color) {
    const object = this.objects.get(id);
    if (!object) return;
    const base = new THREE.Color(color);
    object.state.colors.flesh = color;
    object.state.colors.core = base.clone().offsetHSL(0, -0.05, 0.12).getStyle();
    object.group.traverse((child) => {
      if (!child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material, index) => {
        if (!material.color) return;
        const next = base.clone();
        if (index > 0 || material.opacity > 0.85) next.offsetHSL(0, -0.02, -0.08);
        material.color.copy(next);
      });
    });
    this.emitObjects();
  }

  resetScene() {
    [...this.objects.keys()].forEach((id) => {
      const object = this.objects.get(id);
      this.scene.remove(object.group);
      disposeGroup(object.group);
    });
    this.objects.clear();
    this.clearStack();
    this.tool = 'hand';
    this.addObject('pear', { position: new THREE.Vector3(0, 0, 0) });
    this.setCameraPreset('front');
    this.callbacks.onNotice('Reset to the original pear study.');
  }

  setTool(tool) {
    if (tool === 'split' && this.stacked) {
      this.callbacks.onNotice('Unstack before splitting; cut planes are disabled while pieces are attached to the toothpick.');
      return false;
    }
    this.tool = tool;
    return true;
  }

  setPaused(paused) {
    this.paused = paused;
  }

  setSlowMotion(enabled) {
    this.slowMotion = enabled;
  }

  setFirmness(value) {
    this.settings.firmness = value;
  }

  setDamping(value) {
    this.settings.damping = value;
  }

  shake() {
    if (this.paused) return;
    this.objects.forEach((object, index) => {
      object.applyImpulse(new THREE.Vector3(index % 2 ? -2.4 : 2.4, 1.15, 0.45));
    });
  }

  setCameraPreset(name) {
    const preset = CAMERA_PRESETS[name] ?? CAMERA_PRESETS.front;
    this.cameraState.theta = preset.theta;
    this.cameraState.phi = preset.phi;
    this.cameraState.radius = preset.radius;
    this.frameScene(false);
    this.updateCamera();
  }

  toggleStack() {
    if (this.stacked) {
      this.clearStack();
      this.callbacks.onNotice('Unstacked pieces are independent again.');
      return false;
    }
    if (this.objects.size < 2) {
      this.callbacks.onNotice('Add or split another object before stacking.');
      return false;
    }
    this.stacked = true;
    this.tool = 'hand';
    this.createStick();
    this.updateStackLayout();
    this.callbacks.onNotice('Stacked on a wooden toothpick. Split is disabled until unstacked.');
    return true;
  }

  clearStack() {
    this.stacked = false;
    this.objects.forEach((object) => object.clearStackAnchor());
    if (this.stick) {
      this.scene.remove(this.stick);
      disposeGroup(this.stick);
      this.stick = null;
    }
    this.emitObjects();
  }

  updateStackLayout() {
    if (!this.stacked) {
      this.emitObjects();
      return;
    }

    const objects = [...this.objects.values()].sort((a, b) => a.group.position.y - b.group.position.y);
    const total = objects.reduce((sum, object) => sum + object.bounds.height + 0.24, -0.24);
    let cursor = total / 2;
    objects.forEach((object) => {
      cursor -= object.bounds.height / 2;
      object.setStackAnchor({
        worldPosition: new THREE.Vector3(0, cursor, 0),
        radius: Math.max(0.14, object.bounds.radius * 0.18),
      });
      cursor -= object.bounds.height / 2 + 0.24;
    });

    if (this.stick) {
      const length = Math.max(total + 0.8, 2.2);
      this.stick.scale.set(1, length, 1);
      this.stick.position.set(0, 0, 0.03);
    }
    this.frameScene();
    this.emitObjects();
  }

  createStick() {
    if (this.stick) return;
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: '#b98852',
      roughness: 0.54,
      metalness: 0,
    });
    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 16), material);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    group.add(cylinder);
    group.userData.isStick = true;
    this.stick = group;
    this.scene.add(group);
  }

  emitObjects() {
    this.callbacks.onObjectsChange({
      count: this.objects.size,
      objects: [...this.objects.values()].map((object) => ({
        id: object.state.id,
        label: object.state.type,
        type: object.state.type,
        piece: object.state.piece,
      })),
      stacked: this.stacked,
      qualityReduced: this.qualityReduced,
    });
  }

  onPointerDown(event) {
    if (!this.renderer) return;
    event.preventDefault();
    this.canvas.setPointerCapture?.(event.pointerId);
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.activePointers.size === 2) {
      this.endGrab();
      const [first, second] = [...this.activePointers.values()];
      this.dragState = {
        mode: 'pinch',
        startDistance: distance(first, second),
        startRadius: this.cameraState.radius,
      };
      this.callbacks.onStroke(null);
      return;
    }

    const point = { x: event.clientX, y: event.clientY };
    if (this.tool === 'split') {
      this.dragState = { mode: 'split', start: point, current: point };
      this.callbacks.onStroke({ start: point, current: point });
      return;
    }

    const hit = this.pickObject(event.clientX, event.clientY);
    if (hit) {
      const localPoint = hit.object.group.worldToLocal(hit.point.clone());
      hit.object.beginGrab(localPoint);
      this.dragState = {
        mode: 'grab',
        object: hit.object,
        start: point,
        current: point,
        startTime: performance.now(),
        localZ: localPoint.z,
      };
      this.callbacks.onMenu(null);
      return;
    }

    this.dragState = {
      mode: 'orbit',
      start: point,
      theta: this.cameraState.theta,
      phi: this.cameraState.phi,
    };
    this.callbacks.onMenu(null);
  }

  onPointerMove(event) {
    if (!this.renderer) return;
    if (this.activePointers.has(event.pointerId)) {
      this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (!this.dragState) return;
    event.preventDefault();

    if (this.dragState.mode === 'pinch') {
      if (this.activePointers.size < 2) return;
      const [first, second] = [...this.activePointers.values()];
      const currentDistance = distance(first, second);
      const zoom = this.dragState.startDistance / Math.max(currentDistance, 1);
      this.cameraState.radius = THREE.MathUtils.clamp(this.dragState.startRadius * zoom, 3.2, 9.5);
      this.updateCamera();
      return;
    }

    const current = { x: event.clientX, y: event.clientY };
    this.dragState.current = current;

    if (this.dragState.mode === 'grab') {
      const local = this.screenToObjectLocal(current, this.dragState.object, this.dragState.localZ);
      if (local) this.dragState.object.moveGrab(local);
      return;
    }

    if (this.dragState.mode === 'split') {
      this.callbacks.onStroke({ start: this.dragState.start, current });
      return;
    }

    if (this.dragState.mode === 'orbit') {
      const dx = current.x - this.dragState.start.x;
      const dy = current.y - this.dragState.start.y;
      this.cameraState.theta = this.dragState.theta - dx * 0.006;
      this.cameraState.phi = THREE.MathUtils.clamp(this.dragState.phi + dy * 0.0045, -0.75, 0.85);
      this.updateCamera();
    }
  }

  onPointerUp(event) {
    if (!this.renderer) return;
    event.preventDefault();
    this.activePointers.delete(event.pointerId);
    this.canvas.releasePointerCapture?.(event.pointerId);

    if (!this.dragState) return;
    const dragState = this.dragState;
    this.dragState = null;

    if (dragState.mode === 'grab') {
      const movement = distance(dragState.start, dragState.current ?? dragState.start);
      dragState.object.endGrab();
      if (movement < 7 && performance.now() - dragState.startTime < 320) {
        this.callbacks.onMenu({
          id: dragState.object.state.id,
          position: this.worldToScreen(dragState.object.group.position),
        });
      }
      return;
    }

    if (dragState.mode === 'split') {
      this.callbacks.onStroke(null);
      const movement = distance(dragState.start, dragState.current ?? dragState.start);
      if (movement < 18) {
        this.callbacks.onNotice('Draw a longer stroke across a jelly object to split it.');
        return;
      }
      this.performSplit(dragState.start, dragState.current);
    }
  }

  onWheel(event) {
    if (!this.renderer) return;
    event.preventDefault();
    this.cameraState.radius = THREE.MathUtils.clamp(this.cameraState.radius + event.deltaY * 0.004, 3.2, 9.5);
    this.updateCamera();
  }

  performSplit(start, end) {
    if (this.stacked) {
      this.callbacks.onNotice('Unstack before splitting; cut planes are disabled while stacked.');
      return;
    }

    const hit =
      this.pickObject((start.x + end.x) / 2, (start.y + end.y) / 2) ??
      this.pickObject(start.x, start.y) ??
      this.pickObject(end.x, end.y);

    if (!hit) {
      this.callbacks.onNotice('The split stroke missed every jelly object.');
      return;
    }

    const localA = this.screenToObjectLocal(start, hit.object, 0);
    const localB = this.screenToObjectLocal(end, hit.object, 0);
    if (!localA || !localB || localA.distanceTo(localB) < 0.2) {
      this.callbacks.onNotice('That cut is too small to create stable pieces.');
      return;
    }

    const pieces = clipProfile(hit.object.profile, { x: localA.x, y: localA.y }, { x: localB.x, y: localB.y });
    if (!pieces) {
      this.callbacks.onNotice('Cut rejected because one resulting piece would be too small.');
      return;
    }

    const original = hit.object;
    const originalPosition = original.group.position.clone();
    const originalType = original.state.type;
    const colors = { ...original.state.colors };
    const thickness = original.state.thickness;
    const cutNormal = new THREE.Vector3(-(localB.y - localA.y), localB.x - localA.x, 0).normalize().multiplyScalar(0.045);

    this.scene.remove(original.group);
    disposeGroup(original.group);
    this.objects.delete(original.state.id);

    pieces.forEach((profile, index) => {
      const centroid = profileCentroid(profile);
      const position = originalPosition
        .clone()
        .add(cutNormal.clone().multiplyScalar(index === 0 ? 1 : -1))
        .add(new THREE.Vector3(centroid.x * 0.015, centroid.y * 0.015, 0));
      this.addObject(originalType, {
        profile,
        scale: 1,
        thickness,
        colors,
        piece: true,
        position,
      });
    });
    this.callbacks.onMenu(null);
    this.callbacks.onNotice('Split created two independently deformable jelly pieces.');
  }

  endGrab() {
    if (this.dragState?.mode === 'grab') this.dragState.object.endGrab();
  }

  pickObject(clientX, clientY) {
    this.setPointer(clientX, clientY);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = [];
    this.objects.forEach((object) => {
      object.group.traverse((child) => {
        if (child.isMesh) meshes.push(child);
      });
    });
    const hits = this.raycaster.intersectObjects(meshes, false);
    const hit = hits.find((item) => item.object.userData.baseObjectId);
    if (!hit) return null;
    const object = this.objects.get(hit.object.userData.baseObjectId);
    if (!object) return null;
    return { object, point: hit.point };
  }

  screenToObjectLocal(point, object, localZ = 0) {
    this.setPointer(point.x, point.y);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const planePoint = object.group.localToWorld(new THREE.Vector3(0, 0, localZ));
    const planeNormal = object.group.localToWorld(new THREE.Vector3(0, 0, localZ + 1)).sub(planePoint).normalize();
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);
    const world = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(plane, world)) return null;
    return object.group.worldToLocal(world);
  }

  worldToScreen(worldPosition) {
    const rect = this.canvas.getBoundingClientRect();
    const projected = worldPosition.clone().project(this.camera);
    return {
      x: ((projected.x + 1) / 2) * rect.width + rect.left,
      y: ((-projected.y + 1) / 2) * rect.height + rect.top,
    };
  }

  setPointer(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  updateSize() {
    if (!this.renderer) return;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
  }

  updateCamera() {
    if (!this.camera) return;
    const { theta, phi, radius, target } = this.cameraState;
    const cosPhi = Math.cos(phi);
    this.camera.position.set(
      target.x + Math.sin(theta) * cosPhi * radius,
      target.y + Math.sin(phi) * radius,
      target.z + Math.cos(theta) * cosPhi * radius,
    );
    this.camera.lookAt(target);
  }

  frameScene(adjustRadius = true) {
    if (!this.camera) return;
    if (this.objects.size === 0) return;
    const box = new THREE.Box3();
    this.objects.forEach((object) => box.expandByObject(object.group));
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    this.cameraState.target.lerp(center, 0.35);
    if (adjustRadius) {
      const sceneSize = Math.max(size.x, size.y, size.z, 2.3);
      this.cameraState.radius = THREE.MathUtils.clamp(sceneSize * 2.15, 4.7, 8.4);
    }
    this.updateCamera();
  }

  animate() {
    if (!this.renderer) return;
    this.animationFrame = requestAnimationFrame(() => this.animate());
    const rawDelta = this.clock.getDelta();
    const delta = this.slowMotion ? rawDelta * 0.34 : rawDelta;
    if (!this.paused) {
      this.objects.forEach((object) => object.update(delta, this.settings));
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.animationFrame);
    this.endGrab();
    this.callbacks.onStroke(null);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
    this.canvas.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('resize', this.handleResize);
    this.objects.forEach((object) => disposeGroup(object.group));
    this.objects.clear();
    if (this.stick) disposeGroup(this.stick);
    this.renderer?.dispose();
  }
}

function hasWebGL(canvas) {
  try {
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
