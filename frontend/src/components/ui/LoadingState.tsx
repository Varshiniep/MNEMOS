interface Props { message?: string }

export function LoadingState({ message = 'Loading…' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
