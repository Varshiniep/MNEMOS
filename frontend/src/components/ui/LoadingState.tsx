interface Props { message?: string }

export function LoadingState({ message = 'Loading…' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative">
        <div className="w-10 h-10 rounded-full animate-spin"
          style={{ border: '1.5px solid rgba(139,92,246,0.2)', borderTop: '1.5px solid #8b5cf6' }} />
        <div className="absolute inset-0 rounded-full animate-pulse-ring" />
      </div>
      <p className="mono" style={{ fontSize: 10, color: '#374151', letterSpacing: '0.15em' }}>
        {message.toUpperCase()}
      </p>
    </div>
  );
}
