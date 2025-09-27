import p5 from "p5";
import { type Scene } from "./types";
import { type AiAnalysis } from "@/store/aiStore";

export class PatternedLinesScene implements Scene {
  private p: p5;
  private analysis: AiAnalysis | null = null;
  
  constructor(p: p5) {
    this.p = p;
  }

  rebuild(analysis: AiAnalysis): void {
    this.analysis = analysis;
  }

  private _drawWaves() {
    if (!this.analysis || !this.analysis.patternedLinesParams) return;
    const params = this.analysis.patternedLinesParams;

    const amplitude = this.p.height * 0.1 * params.distortion;
    const timeFactor = this.p.frameCount * 0.005 * this.analysis.visuals.animation.speed;

    for (let i = 0; i < params.density; i++) {
        this.p.beginShape();
        if (params.direction === 'horizontal' || params.direction === 'radial') {
            const y = this.p.map(i, 0, params.density, 0, this.p.height);
            for (let x = 0; x <= this.p.width; x += 10) {
                const noiseVal = this.p.noise(x * 0.005, y * 0.01, timeFactor);
                const distortedY = y + this.p.map(noiseVal, 0, 1, -amplitude, amplitude);
                this.p.vertex(x, distortedY);
            }
        } else { 
            const x = this.p.map(i, 0, params.density, 0, this.p.width);
            for (let y = 0; y <= this.p.height; y += 10) {
                const noiseVal = this.p.noise(x * 0.01, y * 0.005, timeFactor);
                const distortedX = x + this.p.map(noiseVal, 0, 1, -amplitude, amplitude);
                this.p.vertex(distortedX, y);
            }
        }
        this.p.endShape();
    }
  }

  private _drawGrid() {
    if (!this.analysis || !this.analysis.patternedLinesParams) return;
    const params = this.analysis.patternedLinesParams;
    
    const offset = 50 * params.distortion;
    const timeFactor = this.p.frameCount * 0.01 * this.analysis.visuals.animation.speed;

    for (let i = 0; i <= params.density; i++) {
        const x = this.p.map(i, 0, params.density, 0, this.p.width);
        const noiseVal = this.p.noise(i * 0.1, timeFactor);
        const distortedX = x + this.p.map(noiseVal, 0, 1, -offset, offset);
        this.p.line(distortedX, 0, distortedX, this.p.height);
    }

    for (let i = 0; i <= params.density; i++) {
        const y = this.p.map(i, 0, params.density, 0, this.p.height);
        const noiseVal = this.p.noise(i * 0.1, timeFactor + 100); // Add offset to noise
        const distortedY = y + this.p.map(noiseVal, 0, 1, -offset, offset);
        this.p.line(0, distortedY, this.p.width, distortedY);
    }
  }

  private _drawRays() {
    if (!this.analysis || !this.analysis.patternedLinesParams) return;
    const params = this.analysis.patternedLinesParams;
    const center = this.p.createVector(this.p.width / 2, this.p.height / 2);

    const angleDistortion = this.p.PI * 0.1 * params.distortion;
    const timeFactor = this.p.frameCount * 0.002 * this.analysis.visuals.animation.speed;

    for (let i = 0; i < params.density; i++) {
        const baseAngle = this.p.map(i, 0, params.density, 0, this.p.TWO_PI);
        const noiseVal = this.p.noise(i * 0.1, timeFactor);
        const distortedAngle = baseAngle + this.p.map(noiseVal, 0, 1, -angleDistortion, angleDistortion);
        
        const endX = center.x + this.p.width * this.p.cos(distortedAngle);
        const endY = center.y + this.p.width * this.p.sin(distortedAngle);
        
        this.p.line(center.x, center.y, endX, endY);
    }
  }


  draw(): void {
    if (!this.analysis || !this.analysis.patternedLinesParams) return;
    const params = this.analysis.patternedLinesParams;
    const visuals = this.analysis.visuals;

    this.p.stroke(visuals.colorPalette.accent1);
    this.p.strokeWeight(params.thickness);
    this.p.noFill();

    switch(params.pattern) {
        case 'waves':
            this._drawWaves();
            break;
        case 'grid':
            this._drawGrid();
            break;
        case 'rays':
            this._drawRays();
            break;
    }
  }
}