'use client';

import { useState, FormEvent, ChangeEvent, useRef } from 'react';
import { motion } from 'framer-motion';

interface FormState {
  name: string;
  email: string;
  message: string;
  track: File | null;
}

export default function DemoForm() {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    message: '',
    track: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 50 * 1024 * 1024) {
      setError('File must be under 50MB');
      return;
    }
    setFormData((prev) => ({ ...prev, track: file }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.track) {
        setError('Please select an audio file');
        setLoading(false);
        return;
      }

      // Get upload URL from server
      const uploadUrlResponse = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: formData.track.name }),
      });

      if (!uploadUrlResponse.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, downloadUrl } = await uploadUrlResponse.json();

      // Upload file to Vercel Blob
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': formData.track.type },
        body: formData.track,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      // Submit form with download URL
      const submitResponse = await fetch('/api/submit-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          trackUrl: downloadUrl,
          trackName: formData.track.name,
        }),
      });

      if (!submitResponse.ok) throw new Error('Submission failed');

      setSubmitted(true);
      setFormData({ name: '', email: '', message: '', track: null });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="p-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: false, amount: 0.3 }}
    >
      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/20"
        >
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition"
            required
          />
          <textarea
            name="message"
            placeholder="Tell us about your track..."
            value={formData.message}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition resize-none h-24"
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Upload your demo</label>
            <input
              ref={fileInputRef}
              type="file"
              name="track"
              accept="audio/*,.mp3,.wav,.ogg,.m4a"
              onChange={handleFileChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-pink-500 transition"
              required
            />
            {formData.track && <p className="text-sm text-green-400 mt-1">📁 {formData.track.name}</p>}
          </div>
          {error && <p className="text-sm text-red-400">❌ {error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
          >
            {loading ? '📤 Uploading...' : '🚀 Submit Demo'}
          </button>
        </form>
      ) : (
        <motion.div
          className="text-center text-lg text-white bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-green-500/30"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-4">
            🎶
          </motion.div>
          <p className="text-white mb-2">Demo received!</p>
          <p className="text-sm text-gray-400">We'll give it a spin soon.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
