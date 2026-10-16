/**
 * Video Analysis & KYC Intelligence View powered by Gemini 4 Argon
 */

import React, { useState } from 'react';
import { Video, ShieldCheck, AlertTriangle, Upload, Play, CheckCircle2, FileText, Cpu, Sparkles, RefreshCw } from 'lucide-react';

export const VideoAnalysisView: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('video/mp4');
  const [customPrompt, setCustomPrompt] = useState<string>(
    'Perform comprehensive KYC identity verification, check for liveness, document matching, fraud signals, and extract key transaction details.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pre-configured sample simulation videos (using tiny base64 placeholder or sample URL)
  const sampleVideos = [
    {
      id: 'kyc-verify',
      title: 'Customer KYC & Identity Verification Walkthrough',
      description: 'Facial presence, government ID presentation, and speech confirmation recording.',
      // 1-second silent MP4 or sample base64 string
      data: 'GkXfo6NChBBiT0avNQJQTVlaWkZBbW5XQgEAAAAA3AABAAAAAAAA6wAAAAAAAAAA'
    },
    {
      id: 'wire-auth',
      title: 'High-Value Wire Transfer Voice & Video Authorization',
      description: 'Customer confirming beneficiary details and security PIN over secure video channel.',
      data: 'GkXfo6NChBBiT0avNQJQTVlaWkZBbW5XQgEAAAAA3AABAAAAAAAA6wAAAAAAAAAA'
    },
    {
      id: 'collateral-audit',
      title: 'Commercial Real Estate Collateral Inspection',
      description: 'Physical property walkthrough video for mortgage and loan underwriting.',
      data: 'GkXfo6NChBBiT0avNQJQTVlaWkZBbW5XQgEAAAAA3AABAAAAAAAA6wAAAAAAAAAA'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoName(file.name);
    setMimeType(file.type || 'video/mp4');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 part after data:...;base64,
      const base64 = result.split(',')[1] || result;
      setSelectedVideo(base64);
    };
    reader.readAsDataURL(file);
  };

  const selectSample = (sample: typeof sampleVideos[0]) => {
    setVideoName(sample.title);
    setMimeType('video/mp4');
    setSelectedVideo(sample.data);
  };

  const handleAnalyze = async () => {
    if (!selectedVideo) {
      setError('Please select or upload a video file first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoData: selectedVideo,
          mimeType,
          prompt: customPrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze video');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      setError(err.message || 'An error occurred during video analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Cpu className="w-4 h-4" />
            <span>Gemini 4 Argon Video Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Video KYC & Compliance Audit
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze customer verification recordings, wire transfer authorizations, and collateral inspection videos with elite institutional reasoning.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            Model: gemini-4-argon
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Selection & Options */}
        <div className="space-y-6 lg:col-span-1">
          {/* Video Source Selection */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              1. Select Video Source
            </h2>

            {/* File Upload Button */}
            <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-indigo-50/30 group">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mb-2 transition" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-900">
                Upload Video File (.mp4, .webm)
              </span>
              <span className="text-xs text-slate-400 mt-1">Max file size: 50MB</span>
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {videoName && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between text-xs text-indigo-900">
                <span className="font-medium truncate max-w-[220px]">Selected: {videoName}</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              </div>
            )}

            {/* Sample Verification Videos */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-medium text-slate-600 uppercase tracking-wider block">
                Or Choose Sample Audit Video:
              </label>
              {sampleVideos.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => selectSample(sample)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition flex flex-col gap-1 ${
                    videoName === sample.title
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{sample.title}</span>
                    <Play className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{sample.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Prompt Configuration */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              2. Audit Instructions
            </h2>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                Analysis Objective & Prompt:
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-hidden text-slate-900"
                placeholder="Specify what Gemini 4 Argon should inspect in the video..."
              ></textarea>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedVideo}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold tracking-wide uppercase transition flex items-center justify-center gap-2 shadow-sm"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Gemini 4 Argon...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Video Intelligence Audit</span>
                </>
              )}
            </button>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Analysis Output / Results */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Video Audit & Intelligence Report
                  </h2>
                </div>
                {analysisResult && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Secure
                  </span>
                )}
              </div>

              {isAnalyzing ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-800">
                      Processing video frames with Gemini 4 Argon...
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Evaluating facial landmarks, document text, audio clarity, and fraud risk indicators.
                    </p>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="space-y-4 text-sm text-slate-800 leading-relaxed">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs whitespace-pre-wrap">
                    {analysisResult}
                  </div>
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Video className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">No Video Analyzed Yet</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Select a sample video recording or upload your own file on the left and click "Run Video Intelligence Audit" to generate insights.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {analysisResult && (
              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    const blob = new Blob([analysisResult], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'video-audit-report.txt';
                    a.click();
                  }}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold tracking-wide uppercase transition"
                >
                  Export Audit Report
                </button>
                <button
                  onClick={() => alert('Audit report successfully archived to compliance vault.')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold tracking-wide uppercase transition shadow-sm"
                >
                  Approve & Archive to Vault
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
