import p5 from 'p5';
import { type Scene } from './types';
import { type AiAnalysis } from '@/store/aiStore';

class Particle {
    p: p5;
    position: p5.Vector;
    velocity: p5.Vector;
    acceleration: p5.Vector;
    color: p5.Color;
    size: number;
    maxSpeed: number;

    constructor(p: p5, x: number, y: number, size: number, color: p5.Color) {
        this.p = p;
        this.position = this.p.createVector(x, y);
        this.velocity = this.p.createVector(0, 0);
        this.acceleration = this.p.createVector(0, 0);
        this.size = size;
        this.color = color;
        this.maxSpeed = this.p.random(1, 3);
    }

    applyForce(force: p5.Vector) {
        this.acceleration.add(force);
    }

    update(
        movement: string,
        speed: number,
        sceneData: { flowfield: p5.Vector[], cols: number, resolution: number }
    ) {
        switch (movement) {
            case 'flowfield':
                const { resolution, cols, flowfield } = sceneData;
                const x = this.p.floor(this.p.constrain(this.position.x / resolution, 0, cols - 1));
                const y = this.p.floor(this.p.constrain(this.position.y / this.p.height * (this.p.height / resolution), 0, (this.p.height / resolution) - 1));
                const index = x + y * cols;
                if (flowfield && flowfield[index]) {
                    this.applyForce(flowfield[index]);
                }
                break;
            case 'drift':
                if (this.velocity.magSq() === 0) {
                   this.applyForce(p5.Vector.random2D().mult(0.5));
                }
                break;
            case 'vibrate':
                this.applyForce(p5.Vector.random2D().mult(speed));
                break;
            case 'orbit':
                const center = this.p.createVector(this.p.width / 2, this.p.height / 2);
                const dir = p5.Vector.sub(this.position, center);
                const angle = dir.heading();
                dir.setHeading(angle + (0.05 * speed));
                const newPos = p5.Vector.add(center, dir);
                this.position.set(newPos);
                break;
            case 'chase_mouse':
                const mouse = this.p.createVector(this.p.mouseX, this.p.mouseY);
                const chaseForce = p5.Vector.sub(mouse, this.position);
                chaseForce.setMag(0.5 * speed);
                this.applyForce(chaseForce);
                break;
            case 'static':
            default:
                this.velocity.mult(0); 
                break;
        }

        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed * speed);
        this.position.add(this.velocity);
        this.acceleration.mult(0); 

        if (this.position.x > this.p.width + this.size) this.position.x = -this.size;
        if (this.position.x < -this.size) this.position.x = this.p.width + this.size;
        if (this.position.y > this.p.height + this.size) this.position.y = -this.size;
        if (this.position.y < -this.size) this.position.y = this.p.height + this.size;
    }

    display(shape: string) {
        this.p.noStroke();
        this.p.fill(this.color);

        switch (shape) {
            case 'line':
                this.p.stroke(this.color);
                this.p.strokeWeight(this.size / 5 > 1 ? this.size / 5 : 1);
                const end = p5.Vector.add(this.position, this.velocity.copy().setMag(this.size));
                this.p.line(this.position.x, this.position.y, end.x, end.y);
                break;
            case 'triangle':
                const r = this.size / 2;
                this.p.push();
                this.p.translate(this.position.x, this.position.y);
                this.p.rotate(this.velocity.heading());
                this.p.triangle(0, -r, -r, r, r, r);
                this.p.pop();
                break;
            case 'quad':
                this.p.rect(this.position.x, this.position.y, this.size, this.size);
                break;
            case 'circle':
            default:
                this.p.ellipse(this.position.x, this.position.y, this.size, this.size);
                break;
        }
    }
}

export class ParticleSystemScene implements Scene {
  private p: p5;
  private particles: Particle[] = [];
  private analysis: AiAnalysis | null = null;
  
  private resolution = 20;
  private cols: number;
  private rows: number;
  private flowfield: p5.Vector[] = [];
  private zoff = 0;

  constructor(p: p5) {
    this.p = p;
    this.cols = this.p.floor(this.p.width / this.resolution);
    this.rows = this.p.floor(this.p.height / this.resolution);
  }
  
  private _updateFlowfield() {
    if (!this.analysis) return;
    let yoff = 0;
    for (let y = 0; y < this.rows; y++) {
        let xoff = 0;
        for (let x = 0; x < this.cols; x++) {
            const index = x + y * this.cols;
            const angle = this.p.noise(xoff, yoff, this.zoff) * this.p.TWO_PI * 2;
            const v = p5.Vector.fromAngle(angle);
            v.setMag(0.3);
            this.flowfield[index] = v;
            xoff += 0.1;
        }
        yoff += 0.1;
    }
    this.zoff += 0.005 * this.analysis.visuals.animation.speed;
  }

  rebuild(analysis: AiAnalysis): void {
    this.analysis = analysis;
    const params = analysis.particleSystemParams; 
    if (!params) return;

    this.particles = [];
    const colorPalette = analysis.visuals.colorPalette;

    for (let i = 0; i < params.count; i++) {
        let x: number, y: number, size: number, color: p5.Color;
        size = params.size;
        color = this.p.color(this.p.random([colorPalette.accent1, colorPalette.accent2, colorPalette.accent3]));

        switch(params.arrangement) {
            case 'grid':
                const gridCols = Math.floor(this.p.width / (params.size * 2)) || 1;
                x = (i % gridCols) * params.size * 2 + params.size;
                y = Math.floor(i / gridCols) * params.size * 2 + params.size;
                break;
            case 'radial':
                const angleRad = this.p.map(i, 0, params.count, 0, this.p.TWO_PI);
                const radiusRad = this.p.random(50, this.p.width / 3);
                x = this.p.width / 2 + this.p.cos(angleRad) * radiusRad;
                y = this.p.height / 2 + this.p.sin(angleRad) * radiusRad;
                break;
            case 'fall':
                x = this.p.random(this.p.width);
                y = this.p.random(-this.p.height, 0);
                break;
            case 'phyllotaxis':
                const c = params.size / 5;
                const anglePhy = i * 137.5;
                const radiusPhy = c * this.p.sqrt(i);
                x = radiusPhy * this.p.cos(this.p.radians(anglePhy)) + this.p.width / 2;
                y = radiusPhy * this.p.sin(this.p.radians(anglePhy)) + this.p.height / 2;
                size = this.p.random(3, 6);
                break;
            default:
                x = this.p.random(this.p.width);
                y = this.p.random(this.p.height);
                break;
        }
        this.particles.push(new Particle(this.p, x, y, size, color));
    }
  }

  draw(): void {
    if (!this.analysis) return;
    
    const params = this.analysis.particleSystemParams;
    const animation = this.analysis.visuals.animation;
    if (!params) return;

    if (params.movement === 'flowfield') {
      this._updateFlowfield();
    }

    for (const particle of this.particles) {
      particle.update(params.movement, animation.speed, {
        flowfield: this.flowfield,
        cols: this.cols,
        resolution: this.resolution
      });
      particle.display(params.shape);
    }
  }
}