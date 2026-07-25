interface Props { message?: string }

export function LoadingState({ message = 'Loading…' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
