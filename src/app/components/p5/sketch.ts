import p5 from "p5";
import { type AiAnalysis } from "@/store/aiStore";

import { type Scene } from "./scenes/types";
import { ParticleSystemScene } from "./scenes/ParticleSystemScene";
import { DominantObjectScene } from "./scenes/DominantObjectScene";

export interface P5Sketch extends p5 {
  updateWithProps: (props: { analysis: AiAnalysis | null }) => void; 
}

export const sketch = (p: P5Sketch) => {
  let analysis: AiAnalysis | null = null;
  let currentScene: Scene | null = null;
  let lastSceneType: string | undefined = undefined;

  const sceneMap: { [key: string]: Scene } = {};

  p.updateWithProps = (newProps) => {
    analysis = newProps.analysis;
    if (!analysis) {
      return;
    }
    const newSceneType = analysis.sceneType;

    if (newSceneType && newSceneType !== lastSceneType) {
      currentScene = sceneMap[newSceneType] || null;
      lastSceneType = newSceneType;
    }
    
    if (currentScene) {
      currentScene.rebuild(analysis); 
    }
  };

  p.setup = () => {
    p.createCanvas(400, 400);
    p.rectMode(p.CENTER);

    sceneMap['particleSystem'] = new ParticleSystemScene(p);
    sceneMap['dominantObject'] = new DominantObjectScene(p);
  };

  p.draw = () => {
    if (!analysis) {
      p.background(0);
      return;
    }

    p.background(analysis.visuals.colorPalette.mainBg);

    if (currentScene) {
      currentScene.draw();
    }
  };
};