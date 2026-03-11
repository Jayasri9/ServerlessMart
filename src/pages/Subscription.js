function Subscription() {
  return (
    <div className="container">
      <h2>Choose Subscription</h2>
      <button onClick={() => (window.location.href="/tenant")}>Basic</button>
      <button onClick={() => (window.location.href="/tenant")}>Premium</button>
    </div>
  );
}

export default Subscription;