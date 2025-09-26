import { VisualElement } from "framer-motion";
import p5 from "p5";

export interface P5Sketch extends p5 {
  updateWithProps: (props: { colorPalette: string[], visualElements: string[] }) => void;
}

export const sketch = (p: P5Sketch) => {
  let angle = 0;

  let props = {
    colorPalette: ['#242424'],
    visualElements: [] as string[]
  };

  p.updateWithProps = (newProps) => {
    props = { ...props, ...newProps };
  };

  p.setup = () => {
    p.createCanvas(400, 400);
    p.noStroke();
  };

  p.draw = () => {
    const backgroundColor = props.colorPalette[0] || '#242424';
    p.background(backgroundColor);

    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.rotate(angle);

    const rectColor = props.colorPalette[3] || '#FF6496';
    p.fill(rectColor);
    
    p.rectMode("center");
    p.rect(0, 0, 150, 150);
    p.pop();

    angle += 0.01;
  };
};