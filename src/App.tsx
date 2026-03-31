import { useEffect, useRef, useState, useCallback } from 'react';
import { Instagram, Mail, Phone, ExternalLink, Play, X } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  category: string;
  type: 'gdrive' | 'instagram';
  url: string;
  rotation: number;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

const videosData: Omit<Video, 'rotation' | 'x' | 'y' | 'scale' | 'zIndex'>[] = [
  { id: '1', title: 'storytelling', category: 'social media', type: 'gdrive', url: 'https://drive.google.com/file/d/1Ygy6b9WEba8wknziZf5D6xFdv8_Xxqw_/preview' },
  { id: '2', title: 'maths story', category: 'social media', type: 'gdrive', url: 'https://drive.google.com/file/d/15tRblQgimXUQ_ir6iW-QsE1ehRxXREZx/preview' },
  { id: '3', title: 'PPK money', category: 'social media', type: 'gdrive', url: 'https://drive.google.com/file/d/1Lm8ddYOdhbl5-HxMPFY29Ny0vOVsCiiN/preview' },
  { id: '4', title: 'sleeping beauty', category: 'social media', type: 'gdrive', url: 'https://drive.google.com/file/d/1VCqDV_drfmSRUHcn6h1f85SNjAgyUh3T/preview' },
  { id: '5', title: 'revup interview', category: 'documentary', type: 'gdrive', url: 'https://drive.google.com/file/d/1BwA4vlhKdm91kJ4AY3hXIhkERNLtpDET/preview' },
  { id: '6', title: 'barrenness testimony', category: 'excerpts', type: 'gdrive', url: 'https://drive.google.com/file/d/17ph0N1FDZORgbV4GLgY_Tnzo0FBebcf4/preview' },
  { id: '7', title: 'revup ad', category: 'social media', type: 'gdrive', url: 'https://drive.google.com/file/d/17xt6Df9oWALyD-6_DzGcS6wd2qvzN5Lf/preview' },
  { id: '8', title: 'secular songs', category: 'social media', type: 'instagram', url: 'https://www.instagram.com/reel/DOmEb9tDTGM/' },
  { id: '9', title: 'josh trap music', category: 'music video', type: 'instagram', url: 'https://www.instagram.com/reel/DVWW4zKDJii/' },
  { id: '10', title: 'giants', category: 'social media', type: 'gdrive', url: 'https://drive.google.com/file/d/1CLMGwdWb_HRE5o8i16NVezqETGFwCYwD/preview' },
  { id: '11', title: 'restored testicles', category: 'excerpts', type: 'gdrive', url: 'https://drive.google.com/file/d/17ofDXWyaPc0Vr2-4ASdigSQTMUqiGfiI/preview' },
  { id: '12', title: 'T30 Still waters', category: 'long form', type: 'youtube', url: 'https://www.youtube.com/embed/AumTBEsJvZU?si=5Q-Hf1ENkpFIL1Cs' },
];

const categories = ['all', 'social media', 'documentary', 'excerpts', 'music video'];

function generateRandomPosition(index: number): Pick<Video, 'rotation' | 'x' | 'y' | 'scale' | 'zIndex'> {
  const baseX = (index % 3) * 30 + Math.random() * 20;
  const baseY = Math.floor(index / 3) * 25 + Math.random() * 15;
  
  return {
    rotation: (Math.random() - 0.5) * 12,
    x: baseX + (Math.random() - 0.5) * 10,
    y: baseY + (Math.random() - 0.5) * 10,
    scale: 0.9 + Math.random() * 0.2,
    zIndex: Math.floor(Math.random() * 10) + 1,
  };
}

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggedItem = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const randomized = videosData.map((video, index) => ({
      ...video,
      ...generateRandomPosition(index),
    }));
    setVideos(randomized);
    
    // Load Instagram embed script
    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
    
    setTimeout(() => setIsLoaded(true), 100);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });

    if (draggedItem.current) {
      const video = videos.find(v => v.id === draggedItem.current);
      if (video) {
        const newX = ((e.clientX - rect.left - dragOffset.current.x) / rect.width) * 100;
        const newY = ((e.clientY - rect.top - dragOffset.current.y) / rect.height) * 100;
        
        setVideos(prev => prev.map(v => 
          v.id === draggedItem.current 
            ? { ...v, x: Math.max(0, Math.min(85, newX)), y: Math.max(0, Math.min(80, newY)) }
            : v
        ));
      }
    }
  }, [videos]);

  const handleMouseDown = (e: React.MouseEvent, video: Video) => {
    if ((e.target as HTMLElement).tagName === 'IFRAME') return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    draggedItem.current = video.id;
    
    setVideos(prev => prev.map(v => 
      v.id === video.id ? { ...v, zIndex: 100 } : v
    ));
  };

  const handleMouseUp = () => {
    if (draggedItem.current) {
      setVideos(prev => prev.map(v => 
        v.id === draggedItem.current ? { ...v, zIndex: Math.floor(Math.random() * 10) + 1 } : v
      ));
      draggedItem.current = null;
    }
  };

  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === activeCategory);

  const handleVideoClick = (video: Video) => {
    if (draggedItem.current) return;
    setSelectedVideo(video);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden font-light">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-[0.03] transition-transform duration-[3000ms] ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
            transform: `translate(${mousePos.x * 100}px, ${mousePos.y * 100}px)`,
            left: '-400px',
            top: '-400px',
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.02] transition-transform duration-[3000ms] ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
            transform: `translate(${-mousePos.x * 50}px, ${-mousePos.y * 50}px)`,
            right: '-300px',
            bottom: '-300px',
          }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center mix-blend-difference">
        <div className="text-sm tracking-[0.3em] uppercase opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
          Tharde
        </div>
        <nav className="hidden md:flex gap-8 text-xs tracking-[0.2em] uppercase">
          <a href="#work" className="hover:opacity-50 transition-opacity">Work</a>
          <a href="#about" className="hover:opacity-50 transition-opacity">About</a>
          <a href="#contact" className="hover:opacity-50 transition-opacity">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 
            className={`text-[clamp(3rem,15vw,12rem)] font-bold tracking-tighter leading-none transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ letterSpacing: '-0.05em' }}
          >
            THARDE
          </h1>
          <p 
            className={`mt-6 text-xs md:text-sm tracking-[0.5em] uppercase text-neutral-500 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            Visual Storyteller
          </p>
          <div 
            className={`mt-12 flex justify-center gap-4 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {categories.slice(1).map((cat, i) => (
              <span key={cat} className="text-[10px] tracking-[0.2em] uppercase text-neutral-600">
                {cat}
                {i < categories.length - 2 && <span className="ml-4 text-neutral-800">/</span>}
              </span>
            ))}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent animate-pulse" />
        </div>
      </section>

      {/* Category Filter */}
      <section id="work" className="relative py-20 px-4 md:px-8">
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 text-[10px] tracking-[0.3em] uppercase border border-neutral-800 rounded-full transition-all duration-500 hover:border-white hover:bg-white hover:text-black ${
                activeCategory === cat ? 'bg-white text-black border-white' : 'text-neutral-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scattered Video Gallery */}
        <div 
          ref={containerRef}
          className="relative w-full min-h-[200vh]"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {filteredVideos.map((video) => {
            const parallaxX = (mousePos.x - 0.5) * 20 * (video.zIndex / 10);
            const parallaxY = (mousePos.y - 0.5) * 20 * (video.zIndex / 10);
            
            return (
              <div
                key={video.id}
                className="absolute cursor-move group"
                style={{
                  left: `${video.x}%`,
                  top: `${video.y}%`,
                  transform: `translate(-50%, -50%) rotate(${video.rotation}deg) scale(${video.scale})`,
                  zIndex: video.zIndex,
                  transition: draggedItem.current === video.id ? 'none' : 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseDown={(e) => handleMouseDown(e, video)}
                onClick={() => handleVideoClick(video)}
              >
                <div 
                  className="relative w-[280px] md:w-[320px] bg-neutral-900 rounded-sm overflow-hidden shadow-2xl group-hover:shadow-white/10 transition-all duration-500"
                  style={{
                    transform: `translate(${parallaxX}px, ${parallaxY}px)`,
                  }}
                >
                  {/* Video Container */}
                  <div className="relative aspect-video bg-neutral-950 overflow-hidden">
                    {video.type === 'gdrive' ? (
                      <iframe
                        src={video.url}
                        className="w-full h-full pointer-events-none"
                        allow="autoplay"
                      />
                    ) : (
                      <blockquote 
                        className="instagram-media w-full h-full !m-0 !max-w-none !min-w-0"
                        data-instgrm-permalink={video.url}
                        data-instgrm-version="14"
                        style={{ width: '100%', height: '100%' }}
                      />
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-80" />
                    </div>
                  </div>
                  
                  {/* Label */}
                  <div className="p-4 border-t border-neutral-800">
                    <h3 className="text-[11px] tracking-[0.2em] uppercase text-neutral-300">
                      {video.title}
                    </h3>
                    <span className="text-[9px] tracking-[0.15em] uppercase text-neutral-600 mt-1 block">
                      {video.category}
                    </span>
                  </div>
                  
                  {/* Corner Accents */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-l border-t border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-20">
          <p className="text-[10px] tracking-[0.3em] text-neutral-600 uppercase">
            Drag videos to rearrange • Click to expand
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-32 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
                VISUAL<br />STORIES
              </h2>
              <div className="space-y-4 text-neutral-400 text-sm leading-relaxed">
                <p>
                  Crafting narratives that resonate. Every frame is deliberate, every cut meaningful. 
                  Specializing in documentary, social media content, and visual storytelling that 
                  captures authentic human experiences.
                </p>
                <p>
                  Based in Nigeria, working globally. Bringing a unique perspective to every project, 
                  blending cultural nuance with universal appeal.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[3/4] bg-neutral-900 rounded-sm overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center">
                  <span className="text-6xl font-bold text-neutral-800">T</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-neutral-800 rounded-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-32 px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xs tracking-[0.5em] uppercase text-neutral-500 mb-12">Get In Touch</h2>
          
          <div className="space-y-8">
            <a 
              href="mailto:oyetadepeter5@gmail.com" 
              className="group flex items-center justify-center gap-4 text-xl md:text-2xl hover:text-neutral-400 transition-colors"
            >
              <Mail className="w-5 h-5 opacity-50" />
              <span>oyetadepeter5@gmail.com</span>
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
            </a>
            
            <a 
              href="tel:+2348106926908" 
              className="group flex items-center justify-center gap-4 text-lg text-neutral-400 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4 opacity-50" />
              <span>+234 810 692 6908</span>
            </a>
            
            <a 
              href="https://instagram.com/thegreatharde" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 border border-neutral-800 rounded-full hover:bg-white hover:text-black transition-all duration-300 mt-8"
            >
              <Instagram className="w-5 h-5" />
              <span className="text-xs tracking-[0.3em] uppercase">@thegreatharde</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-neutral-900">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-[0.2em] uppercase text-neutral-600">
          <span>© 2025 Tharde</span>
          <span>All Rights Reserved</span>
        </div>
      </footer>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <button 
            className="absolute top-8 right-8 p-2 hover:opacity-50 transition-opacity"
            onClick={() => setSelectedVideo(null)}
          >
            <X className="w-8 h-8" />
          </button>
          
          <div 
            className="w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-neutral-900 rounded-sm overflow-hidden">
              {selectedVideo.type === 'gdrive' ? (
                <iframe
                  src={selectedVideo.url}
                  className="w-full h-full"
                  allow="autoplay"
                />
              ) : (
                <iframe
                  src={`${selectedVideo.url}embed`}
                  className="w-full h-full"
                  allowFullScreen
                />
              )}
            </div>
            <div className="mt-6 flex justify-between items-end">
              <div>
                <h3 className="text-lg tracking-[0.1em] uppercase">{selectedVideo.title}</h3>
                <span className="text-xs text-neutral-500 tracking-[0.2em] uppercase">{selectedVideo.category}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
