import * as THREE from 'three';

const TWO_PI = Math.PI * 2;

export const LIMITS = {
  maxObjects: 8,
  minCutArea: 0.28,
};

export const SWATCHES = [
  '#b7d883',
  '#f17f62',
  '#f6c961',
  '#84c5d8',
  '#d77bb8',
];

export const OBJECT_DEFINITIONS = {
  pear: {
    label: 'Pear slice',
    scale: 1,
    thickness: 0.44,
    skin: '#7da35a',
    flesh: '#f2e7bc',
    core: '#efe0aa',
    seed: '#5e3c24',
  },
  gummy: {
    label: 'Gummy bear',
    scale: 0.82,
    thickness: 0.52,
    skin: '#d56f92',
    flesh: '#e786a8',
    core: '#f1aac0',
    seed: '#ffffff',
  },
  cucumber: {
    label: 'Cucumber slice',
    scale: 0.62,
    thickness: 0.38,
    skin: '#426f35',
    flesh: '#bfdc91',
    core: '#d9e9b2',
    seed: '#f1e7b5',
  },
  watermelon: {
    label: 'Watermelon slice',
    scale: 0.94,
    thickness: 0.42,
    skin: '#2f7a42',
    flesh: '#ea5f64',
    core: '#f29b8c',
    seed: '#2d2620',
  },
  orange: {
    label: 'Orange slice',
    scale: 0.84,
    thickness: 0.4,
    skin: '#e5962d',
    flesh: '#f7b64b',
    core: '#f9d88a',
    seed: '#fff1c5',
  },
};

export function createProfile(type) {
  switch (type) {
    case 'gummy':
      return gummyBearProfile();
    case 'cucumber':
      return ellipseProfile(1.28, 1.12, 80);
    case 'watermelon':
      return watermelonProfile();
    case 'orange':
      return ellipseProfile(1.34, 1.24, 96);
    case 'pear':
    default:
      return pearProfile();
  }
}

export function buildJellyGroup(object) {
  const definition = OBJECT_DEFINITIONS[object.type] ?? OBJECT_DEFINITIONS.pear;
  const profile = ensureWinding(object.profile ?? createProfile(object.type));
  const scale = object.scale ?? definition.scale;
  const thickness = object.thickness ?? definition.thickness;
  const group = new THREE.Group();
  group.name = `${object.type}-${object.id}`;
  group.userData.objectId = object.id;
  group.userData.type = object.type;

  const colors = {
    skin: object.colors?.skin ?? definition.skin,
    flesh: object.colors?.flesh ?? definition.flesh,
    core: object.colors?.core ?? definition.core,
    seed: object.colors?.seed ?? definition.seed,
  };

  const materials = makeMaterials(colors);
  const scaledProfile = profile.map((point) => ({
    x: point.x * scale,
    y: point.y * scale,
  }));
  const shape = shapeFromProfile(scaledProfile);
  const fleshGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 6,
    bevelSize: 0.035 * scale,
    bevelThickness: 0.055 * scale,
    curveSegments: 18,
    steps: 3,
  });
  fleshGeometry.center();
  softenNormals(fleshGeometry);
  const flesh = new THREE.Mesh(fleshGeometry, [materials.flesh, materials.cut]);
  flesh.castShadow = true;
  flesh.receiveShadow = true;
  flesh.userData.deformable = true;
  group.add(flesh);

  const ringWidth = ringWidthFor(object.type) * scale;
  const skinRing = createRingMesh(scaledProfile, ringWidth, thickness / 2 + 0.006, materials.skin);
  if (skinRing) {
    skinRing.userData.deformable = true;
    group.add(skinRing);
  }

  const backSkinRing = createRingMesh(scaledProfile, ringWidth, -thickness / 2 - 0.006, materials.skin);
  if (backSkinRing) {
    backSkinRing.rotation.y = Math.PI;
    backSkinRing.userData.deformable = true;
    group.add(backSkinRing);
  }

  createInteriorDetails(object.type, scaledProfile, thickness, materials, group);

  group.traverse((child) => {
    if (child.isMesh) {
      child.material = Array.isArray(child.material)
        ? child.material.map((material) => material.clone())
        : child.material.clone();
      child.userData.baseObjectId = object.id;
    }
  });

  return { group, bounds: boundsForProfile(scaledProfile, thickness), profile: scaledProfile };
}

export function disposeGroup(group) {
  group.traverse((child) => {
    if (!child.isMesh && !child.isLine) return;
    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => material?.dispose?.());
  });
}

export function clipProfile(profile, a, b) {
  const positive = clipToHalfPlane(profile, a, b, 1);
  const negative = clipToHalfPlane(profile, a, b, -1);
  const left = cleanPolygon(positive);
  const right = cleanPolygon(negative);

  if (Math.abs(polygonArea(left)) < LIMITS.minCutArea || Math.abs(polygonArea(right)) < LIMITS.minCutArea) {
    return null;
  }

  return [ensureWinding(left), ensureWinding(right)];
}

export function polygonArea(profile) {
  if (!profile || profile.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < profile.length; i += 1) {
    const current = profile[i];
    const next = profile[(i + 1) % profile.length];
    area += current.x * next.y - next.x * current.y;
  }
  return area / 2;
}

export function boundsForProfile(profile, thickness = 0.4) {
  const bounds = profile.reduce(
    (box, point) => ({
      minX: Math.min(box.minX, point.x),
      maxX: Math.max(box.maxX, point.x),
      minY: Math.min(box.minY, point.y),
      maxY: Math.max(box.maxY, point.y),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  );
  bounds.width = bounds.maxX - bounds.minX;
  bounds.height = bounds.maxY - bounds.minY;
  bounds.radius = Math.max(bounds.width, bounds.height, thickness) / 2;
  return bounds;
}

export function pointInPolygon(point, profile) {
  let inside = false;
  for (let i = 0, j = profile.length - 1; i < profile.length; j = i, i += 1) {
    const pi = profile[i];
    const pj = profile[j];
    const crosses =
      pi.y > point.y !== pj.y > point.y &&
      point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y + Number.EPSILON) + pi.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

export function profileCentroid(profile) {
  const area = polygonArea(profile);
  if (Math.abs(area) < Number.EPSILON) {
    return { x: 0, y: 0 };
  }
  let x = 0;
  let y = 0;
  for (let i = 0; i < profile.length; i += 1) {
    const current = profile[i];
    const next = profile[(i + 1) % profile.length];
    const cross = current.x * next.y - next.x * current.y;
    x += (current.x + next.x) * cross;
    y += (current.y + next.y) * cross;
  }
  return { x: x / (6 * area), y: y / (6 * area) };
}

export function createObjectState(type, overrides = {}) {
  const definition = OBJECT_DEFINITIONS[type] ?? OBJECT_DEFINITIONS.pear;
  const profile = (overrides.profile ?? createProfile(type)).map((point) => ({ ...point }));
  return {
    id: overrides.id ?? crypto.randomUUID(),
    type,
    profile,
    scale: overrides.scale ?? definition.scale,
    thickness: overrides.thickness ?? definition.thickness,
    colors: {
      skin: overrides.colors?.skin ?? definition.skin,
      flesh: overrides.colors?.flesh ?? definition.flesh,
      core: overrides.colors?.core ?? definition.core,
      seed: overrides.colors?.seed ?? definition.seed,
    },
    position: overrides.position ? overrides.position.clone() : new THREE.Vector3(),
    piece: overrides.piece ?? false,
  };
}

function makeMaterials(colors) {
  return {
    flesh: new THREE.MeshPhysicalMaterial({
      color: colors.flesh,
      roughness: 0.18,
      metalness: 0,
      transmission: 0.22,
      thickness: 0.55,
      transparent: true,
      opacity: 0.82,
      clearcoat: 0.38,
      clearcoatRoughness: 0.22,
      side: THREE.DoubleSide,
    }),
    cut: new THREE.MeshPhysicalMaterial({
      color: colors.core,
      roughness: 0.22,
      transmission: 0.14,
      thickness: 0.4,
      transparent: true,
      opacity: 0.78,
      clearcoat: 0.28,
      side: THREE.DoubleSide,
    }),
    skin: new THREE.MeshPhysicalMaterial({
      color: colors.skin,
      roughness: 0.2,
      transmission: 0.08,
      thickness: 0.22,
      transparent: true,
      opacity: 0.92,
      clearcoat: 0.42,
      side: THREE.DoubleSide,
    }),
    core: new THREE.MeshPhysicalMaterial({
      color: colors.core,
      roughness: 0.25,
      transparent: true,
      opacity: 0.68,
      side: THREE.DoubleSide,
    }),
    seed: new THREE.MeshPhysicalMaterial({
      color: colors.seed,
      roughness: 0.35,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    }),
    line: new THREE.LineBasicMaterial({
      color: colors.core,
      transparent: true,
      opacity: 0.58,
    }),
  };
}

function createInteriorDetails(type, profile, thickness, materials, group) {
  if (type === 'pear') {
    addCore(group, profile, thickness, materials, 0.28, 0.42);
    [
      [-0.13, 0.05, -0.35],
      [0.13, 0.05, 0.35],
      [-0.06, -0.18, 0.1],
      [0.08, -0.19, -0.1],
    ].forEach(([x, y, rotation]) => addSeed(group, profile, thickness, materials, x, y, 0.052, 0.11, rotation));
    return;
  }

  if (type === 'cucumber') {
    addCore(group, profile, thickness, materials, 0.48, 0.38);
    const seedPoints = [
      [-0.18, 0.09],
      [0.18, 0.09],
      [-0.16, -0.12],
      [0.16, -0.12],
      [0, 0.2],
    ];
    seedPoints.forEach(([x, y], index) => addSeed(group, profile, thickness, materials, x, y, 0.045, 0.09, index * 0.28));
    return;
  }

  if (type === 'watermelon') {
    const seeds = [
      [-0.42, 0.2],
      [0.08, 0.33],
      [0.42, 0.1],
      [-0.2, -0.18],
      [0.27, -0.28],
    ];
    seeds.forEach(([x, y], index) => addSeed(group, profile, thickness, materials, x, y, 0.04, 0.1, index * 0.47));
    return;
  }

  if (type === 'orange') {
    addCore(group, profile, thickness, materials, 0.16, 0.16);
    for (let i = 0; i < 10; i += 1) {
      const angle = (i / 10) * TWO_PI;
      const points = [
        new THREE.Vector3(0, 0, thickness / 2 + 0.012),
        new THREE.Vector3(Math.cos(angle) * 0.92, Math.sin(angle) * 0.84, thickness / 2 + 0.012),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, materials.line.clone());
      line.userData.deformable = true;
      group.add(line);
    }
    return;
  }

  if (type === 'gummy') {
    const shineGeometry = new THREE.CircleGeometry(0.12, 24);
    const shine = new THREE.Mesh(shineGeometry, materials.core.clone());
    shine.scale.set(1.5, 0.42, 1);
    shine.position.set(-0.23, 0.42, thickness / 2 + 0.014);
    shine.rotation.z = 0.55;
    shine.userData.deformable = true;
    group.add(shine);
  }
}

function addCore(group, profile, thickness, materials, radiusX, radiusY) {
  if (!pointInPolygon({ x: 0, y: 0 }, profile)) return;
  const geometry = new THREE.CircleGeometry(1, 48);
  const core = new THREE.Mesh(geometry, materials.core.clone());
  core.scale.set(radiusX, radiusY, 1);
  core.position.set(0, -0.04, thickness / 2 + 0.012);
  core.userData.deformable = true;
  group.add(core);

  const back = core.clone();
  back.geometry = geometry.clone();
  back.material = core.material.clone();
  back.position.z = -thickness / 2 - 0.012;
  back.rotation.y = Math.PI;
  group.add(back);
}

function addSeed(group, profile, thickness, materials, x, y, sx, sy, rotation) {
  if (!pointInPolygon({ x, y }, profile)) return;
  const geometry = new THREE.CircleGeometry(1, 24);
  const seed = new THREE.Mesh(geometry, materials.seed.clone());
  seed.scale.set(sx, sy, 1);
  seed.position.set(x, y, thickness / 2 + 0.02);
  seed.rotation.z = rotation;
  seed.userData.deformable = true;
  group.add(seed);

  const back = seed.clone();
  back.geometry = geometry.clone();
  back.material = seed.material.clone();
  back.position.z = -thickness / 2 - 0.02;
  back.rotation.y = Math.PI;
  group.add(back);
}

function createRingMesh(profile, width, z, material) {
  const centroid = profileCentroid(profile);
  const inner = profile.map((point) => {
    const vector = new THREE.Vector2(point.x - centroid.x, point.y - centroid.y);
    const length = Math.max(vector.length(), 0.001);
    const nextLength = Math.max(length - width, length * 0.7);
    vector.setLength(nextLength);
    return { x: centroid.x + vector.x, y: centroid.y + vector.y };
  });

  if (Math.abs(polygonArea(inner)) < 0.01) return null;
  const shape = shapeFromProfile(profile);
  const hole = new THREE.Path();
  ensureWinding(inner).slice().reverse().forEach((point, index) => {
    if (index === 0) hole.moveTo(point.x, point.y);
    else hole.lineTo(point.x, point.y);
  });
  hole.closePath();
  shape.holes.push(hole);
  const geometry = new THREE.ShapeGeometry(shape, 18);
  const ring = new THREE.Mesh(geometry, material.clone());
  ring.position.z = z;
  ring.castShadow = true;
  ring.receiveShadow = true;
  return ring;
}

function shapeFromProfile(profile) {
  const shape = new THREE.Shape();
  profile.forEach((point, index) => {
    if (index === 0) shape.moveTo(point.x, point.y);
    else shape.lineTo(point.x, point.y);
  });
  shape.closePath();
  return shape;
}

function pearProfile() {
  const points = [];
  for (let i = 0; i < 112; i += 1) {
    const theta = (i / 112) * TWO_PI;
    const y = Math.sin(theta);
    const topBias = (y + 1) / 2;
    const width = 0.54 + 0.44 * (1 - topBias) + 0.08 * Math.cos(theta - 0.35);
    const waist = 1 - 0.23 * Math.exp(-((y - 0.45) ** 2) / 0.09);
    points.push({
      x: Math.cos(theta) * width * waist,
      y: y * 1.1 + 0.06 * Math.sin(theta * 2),
    });
  }
  return ensureWinding(points);
}

function watermelonProfile() {
  const points = [];
  for (let i = 0; i < 96; i += 1) {
    const theta = (i / 96) * TWO_PI;
    const lowerRound = 1 + 0.08 * Math.max(0, -Math.sin(theta));
    points.push({
      x: Math.cos(theta) * 1.22 * lowerRound,
      y: Math.sin(theta) * 0.98,
    });
  }
  return ensureWinding(points);
}

function ellipseProfile(rx, ry, segments) {
  return ensureWinding(
    Array.from({ length: segments }, (_, index) => {
      const theta = (index / segments) * TWO_PI;
      return { x: Math.cos(theta) * rx, y: Math.sin(theta) * ry };
    }),
  );
}

function gummyBearProfile() {
  const anchors = [
    [-0.62, -0.72],
    [-0.82, -0.38],
    [-0.66, -0.08],
    [-0.6, 0.16],
    [-0.86, 0.38],
    [-0.62, 0.64],
    [-0.36, 0.54],
    [-0.26, 0.82],
    [0, 0.94],
    [0.26, 0.82],
    [0.36, 0.54],
    [0.62, 0.64],
    [0.86, 0.38],
    [0.6, 0.16],
    [0.66, -0.08],
    [0.82, -0.38],
    [0.62, -0.72],
    [0.3, -0.66],
    [0.2, -0.96],
    [-0.2, -0.96],
    [-0.3, -0.66],
  ];
  return smoothClosedPolyline(anchors.map(([x, y]) => ({ x, y })), 4);
}

function smoothClosedPolyline(points, subdivisions) {
  const result = [];
  for (let i = 0; i < points.length; i += 1) {
    const previous = points[(i - 1 + points.length) % points.length];
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const nextNext = points[(i + 2) % points.length];
    for (let j = 0; j < subdivisions; j += 1) {
      const t = j / subdivisions;
      const t2 = t * t;
      const t3 = t2 * t;
      result.push({
        x:
          0.5 *
          ((2 * current.x) +
            (-previous.x + next.x) * t +
            (2 * previous.x - 5 * current.x + 4 * next.x - nextNext.x) * t2 +
            (-previous.x + 3 * current.x - 3 * next.x + nextNext.x) * t3),
        y:
          0.5 *
          ((2 * current.y) +
            (-previous.y + next.y) * t +
            (2 * previous.y - 5 * current.y + 4 * next.y - nextNext.y) * t2 +
            (-previous.y + 3 * current.y - 3 * next.y + nextNext.y) * t3),
      });
    }
  }
  return ensureWinding(result);
}

function ringWidthFor(type) {
  if (type === 'watermelon') return 0.18;
  if (type === 'cucumber') return 0.14;
  if (type === 'orange') return 0.13;
  if (type === 'gummy') return 0.06;
  return 0.12;
}

function clipToHalfPlane(profile, a, b, side) {
  if (!profile || profile.length < 3) return [];
  const output = [];
  for (let i = 0; i < profile.length; i += 1) {
    const current = profile[i];
    const previous = profile[(i - 1 + profile.length) % profile.length];
    const currentInside = signedLineDistance(a, b, current) * side >= -0.0001;
    const previousInside = signedLineDistance(a, b, previous) * side >= -0.0001;
    if (currentInside !== previousInside) {
      output.push(lineIntersection(previous, current, a, b));
    }
    if (currentInside) output.push({ ...current });
  }
  return output;
}

function signedLineDistance(a, b, point) {
  return (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
}

function lineIntersection(p1, p2, a, b) {
  const x1 = p1.x;
  const y1 = p1.y;
  const x2 = p2.x;
  const y2 = p2.y;
  const x3 = a.x;
  const y3 = a.y;
  const x4 = b.x;
  const y4 = b.y;
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denominator) < 0.00001) return { ...p2 };
  return {
    x: ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denominator,
    y: ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denominator,
  };
}

function cleanPolygon(profile) {
  const cleaned = [];
  profile.forEach((point) => {
    const previous = cleaned[cleaned.length - 1];
    if (!previous || Math.hypot(previous.x - point.x, previous.y - point.y) > 0.01) {
      cleaned.push(point);
    }
  });
  if (cleaned.length > 2) {
    const first = cleaned[0];
    const last = cleaned[cleaned.length - 1];
    if (Math.hypot(first.x - last.x, first.y - last.y) < 0.01) cleaned.pop();
  }
  return cleaned;
}

function ensureWinding(profile) {
  const points = profile.map((point) => ({ x: point.x, y: point.y }));
  return polygonArea(points) < 0 ? points.reverse() : points;
}

function softenNormals(geometry) {
  geometry.computeVertexNormals();
  const normal = geometry.attributes.normal;
  if (!normal) return;
  for (let i = 0; i < normal.count; i += 1) {
    const x = normal.getX(i);
    const y = normal.getY(i);
    const z = normal.getZ(i);
    const length = Math.hypot(x, y, z) || 1;
    normal.setXYZ(i, x / length, y / length, z / length);
  }
  normal.needsUpdate = true;
}
