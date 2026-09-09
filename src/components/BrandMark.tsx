// 상단 좌측 Endicott College of International Studies 로고
export default function BrandMark({ className = '' }: { className?: string }) {
  return (
    <img
      className={`brandmark ${className}`.trim()}
      src="/endicott-logo.png"
      alt="Endicott College of International Studies"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
    />
  )
}
