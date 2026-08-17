'use client';
import { useState } from 'react';

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProcessedVideoUrl(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Server returned ${res.status}`);
      }
      const data = await res.json();
      
      setProcessedVideoUrl(`${apiUrl}${data.video_url}`);
      
    } catch (err) {
      console.error("Error analyzing video:", err);
      alert(err instanceof Error ? err.message : "Failed to analyze video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">AI Workout Form Checker</h1>

      <label className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer font-bold mb-8">
        Upload Workout Video
        <input type="file" accept="video/mp4" onChange={handleFileUpload} className="hidden" />
      </label>

      {loading && <p className="text-xl animate-pulse">Processing video with YOLO...</p>}

      {processedVideoUrl && (
        <div className="w-full max-w-2xl mt-8">
          <h2 className="text-2xl font-semibold mb-4">Processed Video:</h2>
          <video src={processedVideoUrl} controls className="w-full rounded-lg shadow-lg" />
        </div>
      )}
    </main>
  );
}
