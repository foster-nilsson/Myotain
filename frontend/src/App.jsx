import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, CheckCircle2, AlertCircle, Activity, Sparkles } from 'lucide-react';

const SKELETON_EDGES = [
  [0, 1], [0, 2], [1, 3], [2, 4],       // Head
  [5, 6],                               // Shoulders
  [5, 7], [7, 9],                       // Left Arm
  [6, 8], [8, 10],                      // Right Arm
  [5, 11], [6, 12],                     // Torso
  [11, 12],                             // Hips
  [11, 13], [13, 15],                   // Left Leg
  [12, 14], [14, 16]                    // Right Leg
];

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [showSkeleton, setShowSkeleton] = useState(true);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setStatus('Processing video with YOLOv8-Pose... this may take a few moments.');
    setVideoData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const data = await res.json();
      setVideoData(data);
      setStatus(`Analysis complete! Extracted ${data.total_frames} frames.`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoData || !canvasRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const currentFrameIdx = Math.floor(video.currentTime * videoData.fps);
    const frameData = videoData.frames.find((f) => f.frame === currentFrameIdx);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showSkeleton && frameData && frameData.keypoints && frameData.keypoints.length > 0) {
      const kps = frameData.keypoints;

      // Draw skeleton lines (bones)
      ctx.strokeStyle = '#22c55e'; // Emerald green
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      SKELETON_EDGES.forEach(([i, j]) => {
        if (kps[i] && kps[j] && kps[i].conf > 0.4 && kps[j].conf > 0.4) {
          ctx.beginPath();
          ctx.moveTo(kps[i].x, kps[i].y);
          ctx.lineTo(kps[j].x, kps[j].y);
          ctx.stroke();
        }
      });

      // Draw joint points
      ctx.fillStyle = '#ec4899'; // Pink/Magenta nodes
      kps.forEach((kp) => {
        if (kp.conf > 0.4) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }
  };

  return (
    
      
        
        {/* Header */}
        
          
            
            Edge Pose Detection
          
          
            Workout Form Analyzer
          
          
            Run local YOLOv8-Pose inference on your workout recordings with zero latency skeleton tracking.
          
        

        {/* Upload Card */}
        
          
            
              
              
                {file ? file.name : "Select workout video (MP4)..."}
              
               setFile(e.target.files[0])}
              />
            

            
              {loading ? (
                <>
                  
                  Analyzing...
                
              ) : (
                <>
                  
                  Analyze Video
                
              )}
            
          

          {status && (
            
              
              {status}
            
          )}
        

        {/* Video Player & Canvas */}
        {videoData && (
          
            
              
                
                  {videoData.width}x{videoData.height}
                
                
                  {videoData.fps} FPS
                
              

              
                 setShowSkeleton(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                Show Skeleton Overlay
              
            

            
               {
                  if (canvasRef.current && videoRef.current) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                  }
                }}
                className="w-full h-full object-contain"
              />
              
            
          
        )}

      
    
  );
}
