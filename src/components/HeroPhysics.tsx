"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { QrCode, Ticket, Smartphone, Clock, Bell, Users } from "lucide-react";

const physicsItems = [
  { id: "qr", icon: QrCode, label: "Scan & Join", color: "bg-orange-100 text-orange-600 border-orange-200" },
  { id: "ticket", icon: Ticket, label: "#A104", color: "bg-blue-100 text-blue-600 border-blue-200" },
  { id: "phone", icon: Smartphone, label: "Mobile First", color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
  { id: "clock", icon: Clock, label: "0 Wait", color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  { id: "bell", icon: Bell, label: "Alerts", color: "bg-rose-100 text-rose-600 border-rose-200" },
  { id: "users", icon: Users, label: "Crowd", color: "bg-amber-100 text-amber-600 border-amber-200" },
];

export default function HeroPhysics() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const renderLoopRef = useRef<number>(0);
  
  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Matter.js
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;

    const engine = Engine.create();
    engineRef.current = engine;
    
    // Anti-gravity (negative Y pushes things up initially, then we let them drift)
    engine.world.gravity.y = -0.05;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Create bodies
    const bodies = physicsItems.map((_, index) => {
      // Random initial positions near the center/bottom
      const x = width / 2 + (Math.random() * 200 - 100);
      const y = height + 100 + (Math.random() * 200);
      
      return Bodies.rectangle(x, y, 140, 60, {
        chamfer: { radius: 16 }, // Rounded corners
        restitution: 0.8, // Bounciness
        frictionAir: 0.02,
        render: { visible: false } // We use HTML elements for rendering
      });
    });

    // Boundaries (ceiling, floor, walls)
    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Bodies.rectangle(width / 2, height + 60, width * 2, 60, wallOptions);
    const ceiling = Bodies.rectangle(width / 2, -60, width * 2, 60, wallOptions);
    const leftWall = Bodies.rectangle(-60, height / 2, 60, height * 2, wallOptions);
    const rightWall = Bodies.rectangle(width + 60, height / 2, 60, height * 2, wallOptions);

    World.add(engine.world, [...bodies, ground, ceiling, leftWall, rightWall]);

    // Add gentle random forces to keep them floating around
    const interval = setInterval(() => {
      bodies.forEach(body => {
        if (Math.random() > 0.5) {
          Matter.Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * 0.005,
            y: (Math.random() - 0.5) * 0.005
          });
        }
      });
    }, 2000);

    // Add mouse interaction
    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    World.add(engine.world, mouseConstraint);

    // Sync HTML elements with Matter.js bodies
    const syncElements = () => {
      elementsRef.current.forEach((el, index) => {
        if (el && bodies[index]) {
          const body = bodies[index];
          // use translate to move from top-left (0,0) of container
          el.style.transform = `translate(${body.position.x}px, ${body.position.y}px) rotate(${body.angle}rad) translate(-50%, -50%)`;
        }
      });
      Engine.update(engine, 1000 / 60);
      renderLoopRef.current = requestAnimationFrame(syncElements);
    };

    syncElements();

    // Handle resizing
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      // Reposition walls
      Matter.Body.setPosition(ground, { x: newWidth / 2, y: newHeight + 60 });
      Matter.Body.setPosition(ceiling, { x: newWidth / 2, y: -60 });
      Matter.Body.setPosition(rightWall, { x: newWidth + 60, y: newHeight / 2 });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(renderLoopRef.current);
      World.clear(engine.world, false);
      Engine.clear(engine);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
      {physicsItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            ref={(el) => {
                if (el) elementsRef.current[index] = el;
            }}
            className={`absolute top-0 left-0 flex items-center gap-2 px-4 py-3 rounded-2xl glass-card border shadow-xl cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-200 will-change-transform ${item.color}`}
            style={{ width: 140, height: 60 }}
          >
            <Icon size={24} strokeWidth={2.5} />
            <span className="font-bold text-sm tracking-tight">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
