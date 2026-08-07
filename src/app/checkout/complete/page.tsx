import { Suspense } from "react";
import { CheckoutCompletion } from "@/components/checkout/CheckoutCompletion";

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={<section className="section-shell store-page"><div className="site-container"><div className="checkout-confirmation"><p>Confirming payment…</p></div></div></section>}>
      <CheckoutCompletion />
    </Suspense>
  );
}
