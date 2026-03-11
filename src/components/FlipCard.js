function FlipCard({ front, back }) {
  return (
    <div className="flip-card">
      <div className="flip-inner">
        <div className="flip-front">{front}</div>
        <div className="flip-back">{back}</div>
      </div>
    </div>
  );
}

export default FlipCard;