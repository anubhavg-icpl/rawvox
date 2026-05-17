export function TranscriptPanel({
  partial,
  finalText,
}: {
  partial: string;
  finalText: string;
}) {
  const hasAny = partial || finalText;
  return (
    <div className="rounded-xl border border-border-subtle bg-elev-1/60 p-5 min-h-[88px]">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mb-2">
        transcript
      </div>
      {!hasAny && (
        <div className="text-muted text-sm italic">
          Speak into the mic, or type a query below.
        </div>
      )}
      {finalText && (
        <div className="text-primary text-base font-medium leading-relaxed">
          {finalText}
        </div>
      )}
      {partial && (
        <div className="text-secondary text-base leading-relaxed italic">
          {partial}
          <span className="ml-1 inline-block text-raw-glow animate-caret">▮</span>
        </div>
      )}
    </div>
  );
}
