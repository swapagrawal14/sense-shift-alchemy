
import { useEffect, useState } from 'react';

interface Flower {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  speed: number;
  opacity: number;
  emoji: string;
}

export const FloatingFlowers = () => {
  const [flowers, setFlowers] = useState<Flower[]>([]);

  useEffect(() => {
    const flowerEmojis = ['🌸', '🌺', '🌼', '🌻', '🌷', '🦋', '✨', '💫'];
    
    const createFlower = (id: number): Flower => ({
      id,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 50,
      size: Math.random() * 30 + 20,
      rotation: Math.random() * 360,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      emoji: flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)]
    });

    // Initialize flowers
    const initialFlowers = Array.from({ length: 15 }, (_, i) => {
      const flower = createFlower(i);
      flower.y = Math.random() * window.innerHeight;
      return flower;
    });
    setFlowers(initialFlowers);

    let animationId: number;
    let lastTime = 0;
    let flowerIdCounter = 15;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime > 50) { // Throttle to ~20fps
        setFlowers(prevFlowers => {
          let newFlowers = prevFlowers.map(flower => ({
            ...flower,
            y: flower.y - flower.speed,
            rotation: flower.rotation + 0.5,
            x: flower.x + Math.sin(flower.y * 0.01) * 0.5
          })).filter(flower => flower.y > -100);

          // Add new flowers occasionally
          if (Math.random() < 0.03 && newFlowers.length < 20) {
            newFlowers.push(createFlower(flowerIdCounter++));
          }

          return newFlowers;
        });
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {flowers.map(flower => (
        <div
          key={flower.id}
          className="absolute transition-all duration-100 ease-linear"
          style={{
            left: `${flower.x}px`,
            top: `${flower.y}px`,
            fontSize: `${flower.size}px`,
            transform: `rotate(${flower.rotation}deg)`,
            opacity: flower.opacity,
          }}
        >
          {flower.emoji}
        </div>
      ))}
    </div>
  );
};
