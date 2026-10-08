/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";
import { MAPS, TILE } from "../constants/maps";
import { SPECIES } from "../constants/creatures";

export const GameCanvas = React.memo(() => {
  const { px, py, facing, moving, currentMapId } = useGame();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ px, py, facing, moving, currentMapId });

  useEffect(() => {
    stateRef.current = { px, py, facing, moving, currentMapId };
  }, [px, py, facing, moving, currentMapId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameCount = 0;
    let animationFrameId: number;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const TILE_COLORS: Record<number, string> = {
      0: "#7cc66f",
      1: "#2e3a2e",
      2: "#d9c98a",
      3: "#4d96ff",
      4: "#3f8a3a",
      5: "#8a6d3f",
    };

    const drawTree = (x: number, y: number, size: number, mx: number = 0, my: number = 0) => {
      const seed = Math.abs(mx * 31 + my * 17);

      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(x + size * 0.5, y + size * 0.9, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#5a3a22";
      ctx.fillRect(x + size * 0.4, y + size * 0.55, size * 0.2, size * 0.45);

      let leafColor1 = "#2f6e3a";
      let leafColor2 = "#3f8a4a";

      if (seed % 7 === 0) {
        leafColor1 = "#b25e1d";
        leafColor2 = "#d97724";
      } else if (seed % 11 === 0) {
        leafColor1 = "#a03d65";
        leafColor2 = "#c25080";
      } else if (seed % 13 === 0) {
        leafColor1 = "#1a4a40";
        leafColor2 = "#266658";
      }

      ctx.fillStyle = leafColor1;
      ctx.beginPath();
      ctx.ellipse(x + size * 0.5, y + size * 0.4, size * 0.42, size * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = leafColor2;
      ctx.beginPath();
      ctx.ellipse(x + size * 0.38, y + size * 0.32, size * 0.22, size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawGrassBlades = (x: number, y: number, size: number, seed: number) => {
      ctx.strokeStyle = "#5fae53";
      ctx.lineWidth = Math.max(1, size * 0.06);
      const n = 3;
      for (let i = 0; i < n; i++) {
        const bx = x + size * (0.2 + i * 0.3) + (seed % 3) * 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, y + size * 0.9);
        ctx.lineTo(bx - 2, y + size * 0.55);
        ctx.stroke();
      }
    };

    const drawPlayerSprite = (x: number, y: number, dir: string, isMoving: boolean) => {
      const bob = isMoving ? Math.sin(frameCount / 4) * 2 : 0;
      ctx.save();
      ctx.translate(x, y + bob);

      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(TILE / 2, TILE * 0.92, TILE * 0.32, TILE * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#3a5fcf";
      ctx.fillRect(TILE * 0.22, TILE * 0.35, TILE * 0.56, TILE * 0.5);

      ctx.fillStyle = "#ffd9a8";
      ctx.fillRect(TILE * 0.26, TILE * 0.08, TILE * 0.48, TILE * 0.34);

      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(TILE * 0.24, TILE * 0.04, TILE * 0.52, TILE * 0.14);

      ctx.fillStyle = "#1a1a1a";
      if (dir === "down") {
        ctx.fillRect(TILE * 0.34, TILE * 0.22, TILE * 0.07, TILE * 0.07);
        ctx.fillRect(TILE * 0.58, TILE * 0.22, TILE * 0.07, TILE * 0.07);
      } else if (dir === "left") {
        ctx.fillRect(TILE * 0.32, TILE * 0.22, TILE * 0.07, TILE * 0.07);
      } else if (dir === "right") {
        ctx.fillRect(TILE * 0.6, TILE * 0.22, TILE * 0.07, TILE * 0.07);
      }

      ctx.fillStyle = "#222";
      ctx.fillRect(TILE * 0.26, TILE * 0.84, TILE * 0.18, TILE * 0.14);
      ctx.fillRect(TILE * 0.56, TILE * 0.84, TILE * 0.18, TILE * 0.14);
      ctx.restore();
    };

    const drawNpcSprite = (x: number, y: number, kind: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(TILE / 2, TILE * 0.92, TILE * 0.3, TILE * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();

      if (kind === "sign") {
        ctx.fillStyle = "#7a5230";
        ctx.fillRect(TILE * 0.44, TILE * 0.5, TILE * 0.12, TILE * 0.42);
        ctx.fillStyle = "#a9784a";
        ctx.fillRect(TILE * 0.14, TILE * 0.28, TILE * 0.72, TILE * 0.34);
        ctx.strokeStyle = "#5c3d22";
        ctx.lineWidth = 2;
        ctx.strokeRect(TILE * 0.14, TILE * 0.28, TILE * 0.72, TILE * 0.34);
        ctx.restore();
        return;
      }

      if (kind === "bounty_board") {
        ctx.fillStyle = "#5c3d22";
        ctx.fillRect(TILE * 0.4, TILE * 0.5, TILE * 0.2, TILE * 0.42);
        ctx.fillStyle = "#7a5230";
        ctx.fillRect(TILE * 0.08, TILE * 0.16, TILE * 0.84, TILE * 0.44);
        ctx.strokeStyle = "#412a15";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(TILE * 0.08, TILE * 0.16, TILE * 0.84, TILE * 0.44);
        ctx.fillStyle = "#fff8e7";
        ctx.fillRect(TILE * 0.18, TILE * 0.22, TILE * 0.22, TILE * 0.32);
        ctx.strokeStyle = "#cbb185";
        ctx.lineWidth = 1;
        ctx.strokeRect(TILE * 0.18, TILE * 0.22, TILE * 0.22, TILE * 0.32);
        ctx.fillStyle = "#fff";
        ctx.fillRect(TILE * 0.48, TILE * 0.24, TILE * 0.18, TILE * 0.26);
        ctx.strokeRect(TILE * 0.48, TILE * 0.24, TILE * 0.18, TILE * 0.26);
        ctx.fillStyle = "#ffe066";
        ctx.fillRect(TILE * 0.72, TILE * 0.22, TILE * 0.14, TILE * 0.16);
        ctx.fillStyle = "#e0415c";
        ctx.fillRect(TILE * 0.22, TILE * 0.26, TILE * 0.14, TILE * 0.06);
        ctx.restore();
        return;
      }

      let bodyColor = "#c0524d";
      let headColor = "#f2c89b";
      if (kind === "npc_prof") bodyColor = "#e8e8e8";
      if (kind === "npc_leader") bodyColor = "#FFD23F";
      if (kind === "npc_shop") bodyColor = "#41A0E0";
      if (kind === "npc_customer") {
        bodyColor = "#E0415C";
        headColor = "#ffe0c0";
      }

      ctx.fillStyle = bodyColor;
      ctx.fillRect(TILE * 0.22, TILE * 0.35, TILE * 0.56, TILE * 0.5);
      ctx.fillStyle = headColor;
      ctx.fillRect(TILE * 0.26, TILE * 0.08, TILE * 0.48, TILE * 0.34);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(TILE * 0.34, TILE * 0.22, TILE * 0.06, TILE * 0.06);
      ctx.fillRect(TILE * 0.58, TILE * 0.22, TILE * 0.06, TILE * 0.06);
      ctx.restore();
    };

    const drawDecoration = (x: number, y: number, type: string) => {
      ctx.save();
      ctx.translate(x, y);

      if (type === "desk") {
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.beginPath();
        ctx.ellipse(TILE / 2, TILE * 0.92, TILE * 0.42, TILE * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#5c3d22";
        ctx.fillRect(TILE * 0.12, TILE * 0.62, TILE * 0.08, TILE * 0.3);
        ctx.fillRect(TILE * 0.8, TILE * 0.62, TILE * 0.08, TILE * 0.3);
        ctx.fillStyle = "#a9784a";
        ctx.fillRect(TILE * 0.06, TILE * 0.5, TILE * 0.88, TILE * 0.16);
        ctx.fillStyle = "#7a5230";
        ctx.fillRect(TILE * 0.06, TILE * 0.62, TILE * 0.88, TILE * 0.06);
        ctx.fillStyle = "#2a2a2a";
        ctx.fillRect(TILE * 0.36, TILE * 0.26, TILE * 0.28, TILE * 0.22);
        ctx.fillStyle = "#5fc9e0";
        ctx.fillRect(TILE * 0.39, TILE * 0.29, TILE * 0.22, TILE * 0.15);
        ctx.fillStyle = "#2a2a2a";
        ctx.fillRect(TILE * 0.46, TILE * 0.48, TILE * 0.08, TILE * 0.05);
      }

      ctx.restore();
    };

    const render = () => {
      frameCount++;
      const { px: cx, py: cy, facing: cFacing, moving: cMoving, currentMapId: cMapId } = stateRef.current;

      const m = MAPS[cMapId];
      if (!m) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const viewW = canvas.width;
      const viewH = canvas.height;

      ctx.fillStyle = "#16201a";
      ctx.fillRect(0, 0, viewW, viewH);

      const tilesX = Math.ceil(viewW / TILE) + 2;
      const tilesY = Math.ceil(viewH / TILE) + 2;
      const camX = cx - Math.floor(tilesX / 2);
      const camY = cy - Math.floor(tilesY / 2);

      for (let ty = 0; ty < tilesY; ty++) {
        for (let tx = 0; tx < tilesX; tx++) {
          const mx = camX + tx;
          const my = camY + ty;
          const row = m.grid[my];
          const t = row && row[mx] !== undefined ? row[mx] : 1;

          const sx = (mx - camX) * TILE - (cx - camX) * TILE + viewW / 2 - TILE / 2;
          const sy = (my - camY) * TILE - (cy - camY) * TILE + viewH / 2 - TILE / 2;

          if (t === 1) {
            ctx.fillStyle = "#16201a";
            ctx.fillRect(sx, sy, TILE, TILE);
          } else {
            ctx.fillStyle = TILE_COLORS[t] || "#7cc66f";
            ctx.fillRect(sx, sy, TILE, TILE);

            if (t === 4) drawGrassBlades(sx, sy, TILE, mx + my);
            if (t === 2) {
              ctx.strokeStyle = "rgba(0, 0, 0, 0.04)";
              ctx.strokeRect(sx, sy, TILE, TILE);
            }
            if (t === 3) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
              const off = (frameCount / 12) % TILE;
              ctx.fillRect(sx, sy + off - TILE, TILE, 3);
            }
          }

          if (t === 1) {
            drawTree(sx, sy, TILE, mx, my);
          }
        }
      }

      if (m.decorations) {
        m.decorations.forEach((d) => {
          const sx = (d.x - camX) * TILE - (cx - camX) * TILE + viewW / 2 - TILE / 2;
          const sy = (d.y - camY) * TILE - (cy - camY) * TILE + viewH / 2 - TILE / 2;
          drawDecoration(sx, sy, d.type);
        });
      }

      m.npcs.forEach((npc) => {
        const sx = (npc.x - camX) * TILE - (cx - camX) * TILE + viewW / 2 - TILE / 2;
        const sy = (npc.y - camY) * TILE - (cy - camY) * TILE + viewH / 2 - TILE / 2;
        drawNpcSprite(sx, sy, npc.sprite || "npc_gen");
      });

      drawPlayerSprite(viewW / 2 - TILE / 2, viewH / 2 - TILE / 2, cFacing, cMoving);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#16201a]">
      <canvas
        ref={canvasRef}
        className="block image-render-pixelated w-full h-full select-none pointer-events-none"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
});

