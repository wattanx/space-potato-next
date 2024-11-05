"use client";

import { useState, useEffect, useRef } from "react";

const IMAGE_PATH = "/images/potato.png";
const BG_IMAGE_PATH = "/images/eso1006a.jpg";

interface PotatoSprite {
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
  vx: number;
  vy: number;
  radius: number;
  distance: number;
  rotation: number;
  ctx: CanvasRenderingContext2D;
  img: HTMLImageElement;
  setScale(scale: number): void;
}

class PotatoSprite {
  constructor(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    scale: number
  ) {
    this.ctx = ctx;
    this.img = img;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.scale = scale;
    this.updateRadius();
    // Reduced speed values
    this.vx = (Math.floor(Math.random() * 2) + 1) * 0.5;
    this.vy = (Math.floor(Math.random() * 1) + 1) * 0.5;
    this.rotation = 0;
  }

  setScale(scale: number): void {
    this.scale = scale;
    this.updateRadius();
  }

  private updateRadius(): void {
    this.radius = (Math.max(this.w, this.h) * this.scale) / 2;
    this.distance = this.radius + this.scale;
  }

  update(canvasWidth: number, canvasHeight: number): void {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += 0.5;
    this.wallHit(canvasWidth, canvasHeight);
  }

  wallHit(canvasWidth: number, canvasHeight: number): void {
    if (this.x - this.distance <= 0) {
      this.x = this.distance;
      this.vx *= -1;
    } else if (this.x + this.distance >= canvasWidth) {
      this.x = canvasWidth - this.distance;
      this.vx *= -1;
    }

    if (this.y - this.distance <= 0) {
      this.y = this.distance;
      this.vy *= -1;
    } else if (this.y + this.distance >= canvasHeight) {
      this.y = canvasHeight - this.distance;
      this.vy *= -1;
    }
  }

  draw(): void {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate((this.rotation * Math.PI) / 180);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
    this.ctx.restore();
  }

  containsPoint(x: number, y: number): boolean {
    const dx = x - this.x;
    const dy = y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }
}

interface AnimationFrameCallback {
  (): void;
}

const useAnimationFrame = (callback: AnimationFrameCallback): void => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  useEffect(() => {
    const animate = (time: number): void => {
      if (previousTimeRef.current !== undefined) {
        callback();
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callback]);
};

export const SpacePotato: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const potatoImageRef = useRef<HTMLImageElement | null>(null);
  const potatoesRef = useRef<PotatoSprite[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // @ts-expect-error
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // @ts-expect-error
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;

    // Load background image
    const bgImg = new Image();
    bgImg.src = BG_IMAGE_PATH;
    bgImg.onload = () => {
      bgImageRef.current = bgImg;
      initializeBackground();
    };

    // Load potato image
    const potatoImg = new Image();
    potatoImg.src = IMAGE_PATH;
    potatoImg.onload = () => {
      potatoImageRef.current = potatoImg;
      setIsLoading(false);
      addPotato(window.innerWidth / 1.2, window.innerHeight / 1.2, 1);
    };

    const handleResize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeBackground();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initializeBackground = (): void => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const bgImg = bgImageRef.current;

    if (!canvas || !ctx || !bgImg) return;

    let scale: number;
    let pos: number;

    if (canvas.width > canvas.height) {
      scale = Math.max(canvas.width, canvas.height) / bgImg.width;
      pos = (canvas.height - bgImg.height * scale) / 2;
      ctx.drawImage(bgImg, 0, pos, bgImg.width * scale, bgImg.height * scale);
    } else {
      scale = Math.max(canvas.width, canvas.height) / bgImg.height;
      pos = (canvas.width - bgImg.width * scale) / 2;
      ctx.drawImage(bgImg, pos, 0, bgImg.width * scale, bgImg.height * scale);
    }
  };

  const addPotato = (x: number, y: number, initialScale: number) => {
    if (!potatoImageRef.current || !ctxRef.current) return;

    const newScale = initialScale / 1.2;

    const potato = new PotatoSprite(
      ctxRef.current,
      potatoImageRef.current,
      x,
      y,
      potatoImageRef.current.width,
      potatoImageRef.current.height,
      newScale
    );

    potatoesRef.current.push(potato);
    return potato;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const potato of potatoesRef.current) {
      if (potato.containsPoint(x, y)) {
        // 新しいスケールを計算
        const newScale = potato.scale / 1.2;
        // クリックされた potato のスケールを更新
        potato.setScale(newScale);
        // 同じ位置に新しい potato を追加
        addPotato(x, y, newScale);
        break;
      }
    }
  };

  // @ts-expect-error
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file && file.type.match(/image.*/)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImg = new Image();
        // @ts-expect-error
        newImg.src = e.target.result as string;
        newImg.onload = () => {
          potatoImageRef.current = newImg;
          potatoesRef.current = [];
          setScale(1);
          addPotato(window.innerWidth / 2, window.innerHeight / 2, 1);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  useAnimationFrame(() => {
    if (isLoading) return;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (!canvas || !ctx) return;

    // Clear and redraw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initializeBackground();

    // Update and draw potatoes
    for (const potato of potatoesRef.current) {
      potato.update(canvas.width, canvas.height);
      potato.draw();
    }
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute top-0 left-0"
      />
    </div>
  );
};
