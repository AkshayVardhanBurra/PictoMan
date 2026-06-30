import React, { useEffect, useRef, useState } from 'react';

const parseSize = (value, fallback) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    if (value.endsWith('px')) return parseInt(value, 10);
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

export const DrawingBoard = ({ styles = {}, onExport, shouldExport = false }) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [tool, setTool] = useState('pen');
  const [exportDataUrl, setExportDataUrl] = useState('');

  const width = parseSize(styles.width, 600);
  const height = parseSize(styles.height, 400);
  const backgroundColor = styles.backgroundColor || '#ffffff';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }, [width, height, backgroundColor]);

  const getCanvasPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    const point = getCanvasPosition(event);
    isDrawingRef.current = true;
    lastPointRef.current = point;
  };

  const draw = (event) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPoint = getCanvasPosition(event);
    ctx.strokeStyle = tool === 'eraser' ? backgroundColor : color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    lastPointRef.current = currentPoint;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const exportDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    setExportDataUrl(dataUrl);
    if (typeof onExport === 'function') {
      onExport(dataUrl);
    }
  };

  useEffect(() => {
    if (shouldExport) {
      exportDrawing();
    }
  }, [shouldExport]);

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 12,
        ...styles,
      }}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <label>
          Color:
          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>
        <label>
          Stroke width:
          <input
            type="range"
            min="1"
            max="40"
            value={strokeWidth}
            onChange={(event) => setStrokeWidth(parseInt(event.target.value, 10))}
            style={{ marginLeft: 8 }}
          />
          <span style={{ marginLeft: 8 }}>{strokeWidth}px</span>
        </label>
        <button type="button" onClick={() => setTool('pen')} style={{ padding: '6px 12px' }}>
          Pen
        </button>
        <button type="button" onClick={() => setTool('eraser')} style={{ padding: '6px 12px' }}>
          Eraser
        </button>
        <button type="button" onClick={exportDrawing} style={{ padding: '6px 12px' }}>
          Export PNG
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: '1px solid #ccc',
          width: styles.width || `${width}px`,
          height: styles.height || `${height}px`,
          touchAction: 'none',
          cursor: tool === 'eraser' ? 'crosshair' : 'crosshair',
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {exportDataUrl && (
        <div style={{ wordBreak: 'break-all', fontSize: 12 }}>
          <strong>Exported PNG Data URL:</strong>
          <div>{exportDataUrl}</div>
        </div>
      )}
    </div>
  );
};

