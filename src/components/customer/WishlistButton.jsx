import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function WishlistButton({
  productId,
  productName = "this product",
  className = "",
  size = 18,
  onWishlistChange,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWishlistStatus() {
      if (!user?.id || !productId) {
        setIsWishlisted(false);
        return;
      }

      const { data, error } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (!cancelled) {
        if (error) {
          console.error("Unable to load wishlist status:", error);
          return;
        }
        setIsWishlisted(Boolean(data));
      }
    }

    loadWishlistStatus();
    return () => {
      cancelled = true;
    };
  }, [user?.id, productId]);

  async function handleToggle() {
    if (!user?.id) {
      navigate("/login", {
        state: { from: window.location.pathname },
      });
      return;
    }

    if (!productId || loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) throw error;
        setIsWishlisted(false);
        onWishlistChange?.(productId, false);
      } else {
        const { error } = await supabase
          .from("wishlists")
          .upsert(
            { user_id: user.id, product_id: productId },
            { onConflict: "user_id,product_id", ignoreDuplicates: true }
          );

        if (error) throw error;
        setIsWishlisted(true);
        onWishlistChange?.(productId, true);
      }
    } catch (error) {
      console.error("Unable to update wishlist:", error);
      setErrorMessage("Could not update wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        aria-label={
          isWishlisted
            ? `Remove ${productName} from wishlist`
            : `Add ${productName} to wishlist`
        }
        aria-pressed={isWishlisted}
        title={!user ? "Sign in to save this product" : undefined}
        className={`inline-flex items-center justify-center rounded-full transition disabled:cursor-wait disabled:opacity-60 ${
          isWishlisted
            ? "border-rose-200 bg-rose-50 text-rose-500"
            : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-500"
        } ${className}`}
      >
        <Heart
          size={size}
          fill={isWishlisted ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>
      {errorMessage && (
        <span
          role="status"
          className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md bg-slate-950 px-2 py-1.5 text-left text-xs text-white shadow-lg"
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
}
