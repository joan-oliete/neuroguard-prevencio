import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

const PresentationViewer: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalSlides = 15;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    if (currentIndex < totalSlides) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 1) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  return (
    <div className="w-full flex flex-col gap-4 animate-fadeIn">
      <div 
        ref={containerRef}
        className={`relative bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-xl ${
          isFullscreen ? 'w-full h-full' : 'w-full aspect-[4/3] md:aspect-video'
        }`}
      >
        {/* Controls Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10">
          <span className="text-white/90 font-medium bg-black/40 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {currentIndex} / {totalSlides}
          </span>
          <button 
            onClick={toggleFullscreen}
            className="text-white/90 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>

        {/* Main Image Viewer */}
        <div className="relative w-full h-full flex items-center justify-center group bg-black">
          <img 
            src={`/assets/presentacio_nazaret_${currentIndex}.jpg`}
            alt={`Diapositiva ${currentIndex}`}
            className="max-w-full max-h-full object-contain transition-opacity duration-300"
          />

          {/* Navigation Buttons (overlay) */}
          <button 
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            disabled={currentIndex === 1}
            className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-all backdrop-blur-sm ${
              currentIndex === 1 ? 'opacity-0 cursor-default' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
            }`}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            disabled={currentIndex === totalSlides}
            className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-all backdrop-blur-sm ${
              currentIndex === totalSlides ? 'opacity-0 cursor-default' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Thumbnails / Progress */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-1.5 md:gap-2 z-10">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx + 1); }}
              className={`h-1.5 md:h-2 rounded-full transition-all ${
                currentIndex === idx + 1 ? 'w-6 md:w-8 bg-indigo-400' : 'w-1.5 md:w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      
      <p className="text-center text-slate-500 text-sm">
        Fes servir les fletxes del teclat o prem els botons laterals per navegar per la presentació.
      </p>
    </div>
  );
};

export default PresentationViewer;
