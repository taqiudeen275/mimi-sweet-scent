export default function ProductLoading() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1rem 2rem 5rem" }}>
      {/* Breadcrumb skeleton */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0", padding: "1rem 0" }}>
        {[60, 20, 100].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: "12px", width: `${w}px` }} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", marginTop: "1rem" }}>
        {/* Left: image gallery */}
        <div>
          <div className="skeleton" style={{ aspectRatio: "3/4", width: "100%", marginBottom: "0.75rem" }} />
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ width: "72px", height: "88px" }} />
            ))}
          </div>
        </div>

        {/* Right: info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "0.5rem" }}>
          <div className="skeleton" style={{ height: "12px", width: "120px" }} />
          <div>
            <div className="skeleton" style={{ height: "44px", width: "80%", marginBottom: "0.75rem" }} />
            <div className="skeleton" style={{ height: "20px", width: "60%" }} />
          </div>
          <div className="skeleton" style={{ height: "32px", width: "100px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div className="skeleton" style={{ height: "16px", width: "100%" }} />
            <div className="skeleton" style={{ height: "16px", width: "90%" }} />
            <div className="skeleton" style={{ height: "16px", width: "75%" }} />
          </div>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: "36px", width: "72px" }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div className="skeleton" style={{ height: "48px", width: "120px" }} />
            <div className="skeleton" style={{ height: "48px", flex: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
