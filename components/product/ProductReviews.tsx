"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  rating: number;
  body: string | null;
  verified: boolean;
  createdAt: string;
  user: { name: string | null };
}

interface ProductReviewsProps {
  productId: string;
}

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "1px" }} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          style={{
            fontSize: `${size}px`,
            color: "var(--color-primary)",
            lineHeight: 1,
          }}
        >
          {s <= rating ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: "flex", gap: "4px" }} role="group" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${s} star${s !== 1 ? "s" : ""}`}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "22px",
            color: "var(--color-primary)",
            padding: "0 2px",
            lineHeight: 1,
            transition: "transform 100ms ease",
            transform: hovered >= s ? "scale(1.15)" : "scale(1)",
          }}
        >
          {(hovered || value) >= s ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formRating, setFormRating] = useState(0);
  const [formBody, setFormBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setAverage(data.average);
      setTotal(data.total ?? 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formRating === 0) {
      setFormError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating: formRating, body: formBody.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Could not submit review.");
      } else {
        setFormSuccess(true);
        setFormRating(0);
        setFormBody("");
        // Re-fetch to show new review
        await fetchReviews();
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem 0" }}>
        <p style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.75rem",
          color: "var(--color-gray-600)",
        }}>
          Loading reviews…
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Section heading + summary */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: "1.25rem",
        marginBottom: "2rem",
        flexWrap: "wrap",
      }}>
        <h2 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.875rem",
          fontWeight: 400,
          color: "var(--color-black)",
          margin: 0,
        }}>
          Customer Reviews
        </h2>
        {average !== null && total > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <StarDisplay rating={Math.round(average)} size={16} />
            <span style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.75rem",
              color: "var(--color-gray-600)",
              letterSpacing: "0.04em",
            }}>
              {average.toFixed(1)} out of 5 &mdash; {total} review{total !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <p style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.0625rem",
          color: "var(--color-gray-600)",
          fontStyle: "italic",
          marginBottom: "2.5rem",
        }}>
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          marginBottom: "3rem",
        }}>
          {reviews.map(review => (
            <div key={review.id} style={{
              padding: "1.5rem",
              border: "1px solid var(--color-gray-200)",
              background: "var(--color-white)",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
              }}>
                <StarDisplay rating={review.rating} size={13} />
                <span style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-black)",
                  fontWeight: 600,
                }}>
                  {review.user.name ?? "Anonymous"}
                </span>
                {review.verified && (
                  <span style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.5625rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-primary)",
                    fontWeight: 600,
                    border: "1px solid var(--color-primary)",
                    padding: "0.1rem 0.5rem",
                  }}>
                    ✓ Verified Purchase
                  </span>
                )}
                <span style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.625rem",
                  color: "var(--color-gray-400)",
                  marginLeft: "auto",
                }}>
                  {new Date(review.createdAt).toLocaleDateString("en-GH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {review.body && (
                <p style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "1.0625rem",
                  lineHeight: 1.7,
                  color: "var(--color-black)",
                  fontStyle: "italic",
                  margin: 0,
                }}>
                  &ldquo;{review.body}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--color-gray-200)", marginBottom: "2rem" }} />

      {/* Review form or login prompt */}
      {session ? (
        formSuccess ? (
          <div style={{
            padding: "1.5rem",
            background: "var(--color-cream)",
            border: "1px solid var(--color-gray-200)",
          }}>
            <p style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.125rem",
              color: "var(--color-black)",
              margin: 0,
            }}>
              Thank you for your review!
            </p>
          </div>
        ) : (
          <div>
            <h3 style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.375rem",
              fontWeight: 400,
              color: "var(--color-black)",
              margin: "0 0 1.25rem",
            }}>
              Write a Review
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Star picker */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.625rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-gray-600)",
                  fontWeight: 500,
                }}>
                  Your Rating
                </label>
                <StarPicker value={formRating} onChange={setFormRating} />
              </div>

              {/* Body */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label
                  htmlFor="review-body"
                  style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.625rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-gray-600)",
                    fontWeight: 500,
                  }}
                >
                  Your Review <span style={{ color: "var(--color-gray-400)", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                </label>
                <textarea
                  id="review-body"
                  value={formBody}
                  onChange={e => setFormBody(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Share your experience with this product…"
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    border: "1px solid var(--color-gray-200)",
                    background: "var(--color-white)",
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1rem",
                    color: "var(--color-black)",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <p style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.5625rem",
                  color: "var(--color-gray-400)",
                  margin: 0,
                  textAlign: "right",
                }}>
                  {formBody.length}/1000
                </p>
              </div>

              {/* Error */}
              {formError && (
                <p style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.75rem",
                  color: "var(--color-error, #dc2626)",
                  margin: 0,
                }}>
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  alignSelf: "flex-start",
                  padding: "0.75rem 2rem",
                  background: submitting ? "var(--color-gray-200)" : "var(--color-black)",
                  color: submitting ? "var(--color-gray-400)" : "var(--color-white)",
                  border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.625rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  transition: "background 150ms ease",
                }}
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          </div>
        )
      ) : (
        <p style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.8125rem",
          color: "var(--color-gray-600)",
        }}>
          <a href="/account/login" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
            Log in
          </a>{" "}
          to leave a review.
        </p>
      )}
    </div>
  );
}
