import { ArrowRight, Zap } from 'lucide-react'

interface Props {
  onStart: () => void
}

export default function Landing({ onStart }: Props) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black px-6">
      <div
        className="anim-orb-1 absolute top-[-180px] left-[-120px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="anim-orb-2 absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
        <div className="anim-fade-up inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 text-[13px] text-white/40 mb-8"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <Zap size={11} className="text-indigo-400" />
          AI-powered code intelligence
        </div>

        <h1
          className="anim-fade-up-delay font-semibold text-white mb-6"
          style={{
            fontSize: 'clamp(48px, 7vw, 80px)',
            lineHeight: '1.05',
            letterSpacing: '-0.04em',
          }}
        >
          Understand any codebase,
          <br />
          <span
            style={{
              backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            instantly.
          </span>
        </h1>

        <p
          className="anim-fade-up-delay-2 text-white/40 mb-12 max-w-lg"
          style={{ fontSize: '18px', lineHeight: '1.6', letterSpacing: '-0.01em' }}
        >
          Ingest any GitHub repository. Ask questions in plain English.
          Get answers grounded in real source files — with exact citations.
        </p>

        <button
          onClick={onStart}
          className="anim-fade-up-delay-3 group inline-flex items-center gap-2.5 rounded-full text-[15px] font-medium transition-all duration-300 hover:gap-4"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            padding: '14px 32px',
            letterSpacing: '-0.01em',
            boxShadow: '0 0 40px rgba(99,102,241,0.3)',
          }}
        >
          Get Started
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>

        <div className="anim-fade-up-delay-3 mt-16 flex items-center gap-8 text-[13px] text-white/20">
          <span>Vector + BM25 hybrid search</span>
          <span className="w-px h-3 bg-white/10" />
          <span>Inline code citations</span>
          <span className="w-px h-3 bg-white/10" />
          <span>Gemini 2.5 Flash</span>
        </div>
      </div>
    </div>
  )
}
