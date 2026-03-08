export default function ShopLoading() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div className="skeleton" style={{ width: "80px", height: "12px", margin: "0 auto 0.75rem" }} />
        <div className="skeleton" style={{ width: "260px", height: "48px", margin: "0 auto 1rem" }} />
        <div className="skeleton" style={{ width: "80px", height: "12px", margin: "0 auto" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "2rem" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton" style={{ aspectRatio: "3/4", width: "100%", marginBottom: "1rem" }} />
            <div className="skeleton" style={{ height: "12px", width: "60%", marginBottom: "0.5rem" }} />
            <div className="skeleton" style={{ height: "20px", width: "80%", marginBottom: "0.5rem" }} />
            <div className="skeleton" style={{ height: "16px", width: "40%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
