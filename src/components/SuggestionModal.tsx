import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, X, CheckCircle, Sparkles } from 'lucide-react';
import { submitUserFeedback } from '../lib/realtime';

export const SuggestionModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    // Check if user already submitted feedback in this session or dismissed
    const hasResponded = localStorage.getItem('portfolio-feedback-submitted');
    if (!hasResponded) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 7000); // Trigger popup after 7 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('portfolio-feedback-submitted', 'dismissed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !suggestion.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitUserFeedback({
        name: name.trim(),
        rating,
        suggestion: suggestion.trim(),
      });
      setIsSubmitted(true);
      localStorage.setItem('portfolio-feedback-submitted', 'true');
      setTimeout(() => {
        setIsOpen(false);
      }, 2500);
    } catch (error) {
      console.error('Feedback submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-full max-w-sm px-4">
      <div className="glass border border-white/20 p-5 rounded-2xl shadow-[0_0_40px_rgba(255,115,0,0.3)] bg-black/90 relative overflow-hidden animate-in slide-in-from-bottom duration-300">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          title="Close"
        >
          <X size={16} />
        </button>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle size={44} className="text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-orbitron font-bold text-light text-base">Thank You!</h4>
            <p className="font-mono text-xs text-slate-300">
              Your feedback &amp; review have been received. We appreciate your suggestion!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30">
                <MessageSquarePlus size={18} />
              </div>
              <div>
                <h4 className="font-orbitron font-bold text-sm text-light flex items-center gap-1.5">
                  Your Feedback Matters <Sparkles size={14} className="text-accent" />
                </h4>
                <p className="font-mono text-[11px] text-slate-400">Help us improve &amp; share suggestions!</p>
              </div>
            </div>

            {/* Rating Stars */}
            <div className="space-y-1 text-center">
              <p className="font-mono text-[11px] text-slate-400">Rate your experience:</p>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={20}
                      className={(hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-slate-600'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-2">
              <input
                type="text"
                className="input-shell text-xs py-2 px-3 w-full"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                required
              />
              <textarea
                className="input-shell text-xs py-2 px-3 w-full h-16 resize-none"
                placeholder="What features or improvements would you like to see?"
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                maxLength={300}
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-black py-2 rounded-xl text-xs font-bold font-orbitron uppercase tracking-wider hover:shadow-[0_0_15px_rgba(255,115,0,0.5)] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 glass border-white/10 text-slate-400 text-xs font-mono rounded-xl hover:text-white hover:bg-white/5 transition-all"
              >
                Later
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
