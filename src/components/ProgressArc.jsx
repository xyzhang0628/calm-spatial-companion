function ProgressArc({ progress = 0 }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  return (
    <div
      className="progress-arc"
      aria-label={`Walk progress, ${Math.round(progress * 100)} percent`}
    >
      <svg width="80" height="80" viewBox="0 0 80 80" role="img" aria-hidden="true">
        <circle className="progress-arc__track" cx="40" cy="40" r={radius} />
        <circle
          className="progress-arc__meter"
          cx="40"
          cy="40"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
    </div>
  );
}

export default ProgressArc;
