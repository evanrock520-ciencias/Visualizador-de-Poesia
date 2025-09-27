import { useRef, useEffect, useState } from "react";
import p5 from "p5";
import useAiStore from "@/store/aiStore";
import { type P5Sketch } from "./p5/sketch"; 

type P5WrapperProps = {
  sketch: (p: P5Sketch) => void;
};

export default function P5Wrapper({ sketch }: P5WrapperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<P5Sketch | null>(null);
  const [isClient, setIsClient] = useState(false);

  const analysis = useAiStore(state => state.analysis);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current || p5InstanceRef.current) {
      return;
    }

    console.log("🔄 Inicializando p5.js...");
    p5InstanceRef.current = new p5(sketch, containerRef.current) as P5Sketch;

    if (analysis) {
      p5InstanceRef.current.updateWithProps({ analysis });
    }

    return () => {
      if (p5InstanceRef.current) {
        console.log("🧹 Limpiando p5.js...");
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [isClient, sketch]);

  useEffect(() => {
    if (p5InstanceRef.current && analysis) {
      console.log("🚀 Pasando nueva data de análisis a p5.js...");
      p5InstanceRef.current.updateWithProps({ analysis });
    }
  }, [analysis]);

  if (!isClient) {
    return <div className="w-full h-full flex justify-center items-center"></div>;
  }

  return <div ref={containerRef} className="w-full h-full flex justify-center items-center"></div>;
}