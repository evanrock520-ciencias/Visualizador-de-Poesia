// src/app/p5/scenes/DominantObjectScene.ts

import p5 from "p5";
import { type Scene } from "./types";
import { type AiAnalysis } from "@/store/aiStore";

export class DominantObjectScene implements Scene {
  private p: p5;
  private analysis: AiAnalysis | null = null;
  
  private position: p5.Vector;
  private basePosition: p5.Vector;
  private targetSize: number = 0;
  private currentSize: number = 0; 
  private color: p5.Color;
  private noiseTime: number = 0; 

  constructor(p: p5) {
    this.p = p;
    this.position = this.p.createVector(0, 0);
    this.basePosition = this.p.createVector(0, 0);
    this.color = this.p.color(255);
  }

  rebuild(analysis: AiAnalysis): void {
    this.analysis = analysis;
    const params = analysis.dominantObjectParams;
    if (!params) return;

    this.basePosition.set(
      params.position.x * this.p.width,
      params.position.y * this.p.height
    );
    this.position.set(this.basePosition.x, this.basePosition.y);

    this.targetSize = params.size * this.p.width;
    
    if (params.animationStyle === 'grow') {
      this.currentSize = 0;
    } else {
      this.currentSize = this.targetSize;
    }

    this.color = this.p.color(analysis.visuals.colorPalette.accent1);
    this.noiseTime = this.p.random(1000); 
  }

  draw(): void {
    if (!this.analysis || !this.analysis.dominantObjectParams) return;
    
    const params = this.analysis.dominantObjectParams;
    const visuals = this.analysis.visuals;

    this.currentSize = this.p.lerp(this.currentSize, this.targetSize, 0.08);

    if (params.driftIntensity && params.driftIntensity > 0) {
      const driftAmount = params.driftIntensity * visuals.animation.speed;
      const driftX = this.p.map(this.p.noise(this.noiseTime), 0, 1, -driftAmount, driftAmount);
      const driftY = this.p.map(this.p.noise(this.noiseTime + 100), 0, 1, -driftAmount, driftAmount);
      this.position.set(this.basePosition.x + driftX, this.basePosition.y + driftY);
      this.noiseTime += 0.005 * visuals.animation.speed;
    }

    let finalDrawSize = this.currentSize;
    if (params.animationStyle === 'pulse' && params.pulsation) {
      const pulseIntensity = params.pulsation.intensity * (this.currentSize * 0.2);
      const pulseSpeed = params.pulsation.speed * this.p.frameCount * 0.05;
      finalDrawSize = this.currentSize + this.p.sin(pulseSpeed) * pulseIntensity;
    }

    this.p.push(); 

    switch (params.texture) {
      case 'noisy':
        const grain = this.p.random(-15, 15);
        const noisyColor = this.p.color(
          this.p.red(this.color) + grain,
          this.p.green(this.color) + grain,
          this.p.blue(this.color) + grain
        );
        this.p.fill(noisyColor);
        this.p.noStroke();
        break;
      
      case 'gradient':
        const gradient = this.p.drawingContext.createLinearGradient(
            this.position.x - finalDrawSize / 2, this.position.y,
            this.position.x + finalDrawSize / 2, this.position.y
        );
        gradient.addColorStop(0, this.p.color(visuals.colorPalette.accent1).toString());
        gradient.addColorStop(1, this.p.color(visuals.colorPalette.accent2).toString());
        this.p.drawingContext.fillStyle = gradient;
        this.p.noStroke();
        break;

      case 'glow':
        this.p.drawingContext.shadowBlur = 32;
        this.p.drawingContext.shadowColor = this.color.toString();
        this.p.fill(this.color);
        this.p.noStroke();
        break;

      case 'wireframe':
        this.p.noFill();
        this.p.stroke(this.color);
        this.p.strokeWeight(2);
        break;
      
      case 'solid':
      default:
        this.p.fill(this.color);
        this.p.noStroke();
        break;
    }

    if (params.shape === 'circle' && params.deformationIntensity && params.deformationIntensity > 0) {
      const deform = params.deformationIntensity;
      const time = this.p.frameCount * 0.01 * visuals.animation.speed;
      this.p.beginShape();
      for (let a = 0; a < this.p.TWO_PI; a += 0.1) {
          let xOff = this.p.map(this.p.cos(a), -1, 1, 0, 3);
          let yOff = this.p.map(this.p.sin(a), -1, 1, 0, 3);
          let noise = this.p.noise(xOff, yOff, time);
          let offset = this.p.map(noise, 0, 1, -finalDrawSize * deform, finalDrawSize * deform);
          let r = finalDrawSize / 2 + offset;
          let x = this.position.x + r * this.p.cos(a);
          let y = this.position.y + r * this.p.sin(a);
          this.p.vertex(x, y);
      }
      this.p.endShape(this.p.CLOSE);
    } else {
      switch (params.shape) {
          case 'quad':
              this.p.rect(this.position.x, this.position.y, finalDrawSize, finalDrawSize);
              break;
          case 'triangle':
              const r = finalDrawSize / 2;
              this.p.triangle(
                this.position.x, this.position.y - r,
                this.position.x - r, this.position.y + r,
                this.position.x + r, this.position.y + r
              );
              break;
          case 'circle':
          default:
              this.p.ellipse(this.position.x, this.position.y, finalDrawSize, finalDrawSize);
              break;
      }
    }

    this.p.pop();
  }
}