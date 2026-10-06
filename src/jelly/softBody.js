import * as THREE from 'three';

const scratch = {
  base: new THREE.Vector3(),
  displacement: new THREE.Vector3(),
  radial: new THREE.Vector3(),
};

export class SoftBodyObject {
  constructor(state, built) {
    this.state = state;
    this.group = built.group;
    this.bounds = built.bounds;
    this.profile = built.profile;
    this.radius = built.bounds.radius;
    this.entries = [];
    this.grab = null;
    this.stackAnchor = null;
    this.velocity = new THREE.Vector3();
    this.originalPosition = state.position.clone();
    this.group.position.copy(state.position);

    this.group.traverse((child) => {
      if (!child.geometry || !child.userData.deformable) return;
      const position = child.geometry.attributes.position;
      if (!position) return;
      this.entries.push({
        object: child,
        geometry: child.geometry,
        base: new Float32Array(position.array),
        displacement: new Float32Array(position.array.length),
        velocity: new Float32Array(position.array.length),
      });
    });
  }

  setPosition(position) {
    this.group.position.copy(position);
    this.state.position = position.clone();
    this.originalPosition.copy(position);
  }

  beginGrab(localPoint) {
    this.grab = {
      localPoint: localPoint.clone(),
      target: localPoint.clone(),
      radius: Math.max(this.radius * 0.52, 0.42),
    };
  }

  moveGrab(localPoint) {
    if (!this.grab) return;
    this.grab.target.copy(localPoint);
  }

  endGrab() {
    this.grab = null;
  }

  applyImpulse(vector) {
    this.entries.forEach((entry) => {
      for (let i = 0; i < entry.velocity.length; i += 3) {
        const y = entry.base[i + 1];
        const weight = 0.45 + Math.min(Math.abs(y) / Math.max(this.radius, 0.001), 1) * 0.65;
        entry.velocity[i] += vector.x * weight;
        entry.velocity[i + 1] += vector.y * weight;
        entry.velocity[i + 2] += vector.z * weight;
      }
    });
  }

  setStackAnchor(anchor) {
    this.stackAnchor = anchor;
  }

  clearStackAnchor() {
    this.stackAnchor = null;
  }

  reset() {
    this.grab = null;
    this.stackAnchor = null;
    this.velocity.set(0, 0, 0);
    this.group.position.copy(this.originalPosition);
    this.state.position = this.originalPosition.clone();
    this.entries.forEach((entry) => {
      entry.displacement.fill(0);
      entry.velocity.fill(0);
      entry.geometry.attributes.position.array.set(entry.base);
      entry.geometry.attributes.position.needsUpdate = true;
      entry.geometry.computeVertexNormals?.();
    });
  }

  update(delta, settings) {
    const dt = Math.min(delta, 1 / 30);
    if (this.stackAnchor) {
      this.group.position.lerp(this.stackAnchor.worldPosition, 1 - Math.exp(-9 * dt));
      this.state.position = this.group.position.clone();
    }

    const stiffness = THREE.MathUtils.lerp(16, 42, settings.firmness);
    const damping = THREE.MathUtils.lerp(3.8, 10.5, settings.damping);
    const returnStiffness = stiffness * 0.68;
    const maxStretch = this.radius * THREE.MathUtils.lerp(0.55, 0.32, settings.firmness);

    this.entries.forEach((entry) => {
      const positions = entry.geometry.attributes.position.array;
      let meanX = 0;
      let meanY = 0;
      let meanZ = 0;
      let count = 0;

      for (let i = 0; i < positions.length; i += 3) {
        scratch.base.set(entry.base[i], entry.base[i + 1], entry.base[i + 2]);
        scratch.displacement.set(entry.displacement[i], entry.displacement[i + 1], entry.displacement[i + 2]);

        const force = scratch.radial.set(0, 0, 0);
        if (this.grab) {
          const distance = scratch.base.distanceTo(this.grab.localPoint);
          const falloff = Math.exp(-(distance * distance) / (2 * this.grab.radius * this.grab.radius));
          const desired = this.grab.target.clone().sub(this.grab.localPoint).multiplyScalar(falloff);
          force.copy(desired.sub(scratch.displacement)).multiplyScalar(stiffness);
        } else {
          force.copy(scratch.displacement).multiplyScalar(-returnStiffness);
        }

        if (this.stackAnchor) {
          const centerDistance = Math.hypot(scratch.base.x, scratch.base.y);
          const pinWeight = Math.exp(-(centerDistance * centerDistance) / (2 * this.stackAnchor.radius * this.stackAnchor.radius));
          force.addScaledVector(scratch.displacement, -stiffness * 1.6 * pinWeight);
        }

        entry.velocity[i] += force.x * dt;
        entry.velocity[i + 1] += force.y * dt;
        entry.velocity[i + 2] += force.z * dt;

        const decay = Math.exp(-damping * dt);
        entry.velocity[i] *= decay;
        entry.velocity[i + 1] *= decay;
        entry.velocity[i + 2] *= decay;

        entry.displacement[i] += entry.velocity[i] * dt;
        entry.displacement[i + 1] += entry.velocity[i + 1] * dt;
        entry.displacement[i + 2] += entry.velocity[i + 2] * dt;

        scratch.displacement.set(entry.displacement[i], entry.displacement[i + 1], entry.displacement[i + 2]);
        if (scratch.displacement.length() > maxStretch) {
          scratch.displacement.setLength(maxStretch);
          entry.displacement[i] = scratch.displacement.x;
          entry.displacement[i + 1] = scratch.displacement.y;
          entry.displacement[i + 2] = scratch.displacement.z;
          entry.velocity[i] *= 0.25;
          entry.velocity[i + 1] *= 0.25;
          entry.velocity[i + 2] *= 0.25;
        }

        meanX += entry.displacement[i];
        meanY += entry.displacement[i + 1];
        meanZ += entry.displacement[i + 2];
        count += 1;
      }

      const centerCorrection = count > 0 ? 0.22 / count : 0;
      meanX *= centerCorrection;
      meanY *= centerCorrection;
      meanZ *= centerCorrection;

      for (let i = 0; i < positions.length; i += 3) {
        const correctedX = entry.displacement[i] - meanX;
        const correctedY = entry.displacement[i + 1] - meanY;
        const correctedZ = entry.displacement[i + 2] - meanZ;
        positions[i] = entry.base[i] + correctedX;
        positions[i + 1] = entry.base[i + 1] + correctedY;
        positions[i + 2] = entry.base[i + 2] + correctedZ;
      }

      entry.geometry.attributes.position.needsUpdate = true;
      entry.geometry.computeVertexNormals?.();
    });
  }
}
