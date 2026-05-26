export default function ProgressArc({ progress, color }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  return (
    <svg className="progress-arc" viewBox="0 0 64 64" aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r={radius}
        className="progress-arc__track"
        strokeWidth="4"
      />
      <circle
        cx="32"
        cy="32"
        r={radius}
        className="progress-arc__value"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
