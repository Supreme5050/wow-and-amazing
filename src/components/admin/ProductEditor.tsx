"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon } from "@/components/icons/LineIcons";
import { ownerFetch } from "@/lib/admin/client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { STORE_CURRENCY } from "@/lib/store/currency";
import { getCategoryMerchandising } from "@/data/categoryMerchandising";
import { getAdminCategoryLabel } from "@/data/publicDepartments";

type Category = { id: string; name: string; slug: string };
type Variant = { key: string; name: string; priceDelta: number; stockQty: number };
type RawProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_urls: string[];
  is_featured: boolean;
  is_active: boolean;
  category_id: string;
  subcategory_slug: string | null;
  product_variants: { id: string; name: string; price_delta: number; stock_qty: number }[];
  rental_bedrooms: number | null;
  rental_bathrooms: number | null;
  rental_location: string | null;
  rental_size_label: string | null;
  rental_property_type: string | null;
  rental_status: "available" | "reserved" | "rented" | null;
};

const initialVariant = (): Variant => ({ key: crypto.randomUUID(), name: "Standard", priceDelta: 0, stockQty: 1 });

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const editing = Boolean(productId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [subcategorySlug, setSubcategorySlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isFeatured, setFeatured] = useState(false);
  const [isActive, setActive] = useState(true);
  const [variants, setVariants] = useState<Variant[]>([initialVariant()]);
  const [rentalBedrooms, setRentalBedrooms] = useState("");
  const [rentalBathrooms, setRentalBathrooms] = useState("");
  const [rentalLocation, setRentalLocation] = useState("");
  const [rentalSizeLabel, setRentalSizeLabel] = useState("");
  const [rentalPropertyType, setRentalPropertyType] = useState("");
  const [rentalStatus, setRentalStatus] = useState<"available" | "reserved" | "rented">("available");
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const catalog = await ownerFetch<{ categories: Category[] }>("/api/admin/products");
        if (!active) return;
        setCategories(catalog.categories);
        setCategoryId((current) => current || catalog.categories[0]?.id || "");
        setSubcategorySlug((current) => current || (catalog.categories[0] ? getCategoryMerchandising(catalog.categories[0].slug).subcategories[0]?.slug ?? "" : ""));
        if (!productId) return;
        const result = await ownerFetch<{ product: RawProduct }>(`/api/admin/products/${productId}`);
        if (!active) return;
        const product = result.product;
        setName(product.name);
        setSlug(product.slug);
        setSlugTouched(true);
        setCategoryId(product.category_id);
        setSubcategorySlug(product.subcategory_slug || "");
        setDescription(product.description);
        setPrice(Number(product.price));
        setImageUrls(product.image_urls || []);
        setFeatured(product.is_featured);
        setActive(product.is_active);
        setVariants(product.product_variants?.length ? product.product_variants.map((variant) => ({ key: variant.id, name: variant.name, priceDelta: Number(variant.price_delta), stockQty: Number(variant.stock_qty) })) : [initialVariant()]);
        setRentalBedrooms(product.rental_bedrooms === null || product.rental_bedrooms === undefined ? "" : String(product.rental_bedrooms));
        setRentalBathrooms(product.rental_bathrooms === null || product.rental_bathrooms === undefined ? "" : String(product.rental_bathrooms));
        setRentalLocation(product.rental_location || "");
        setRentalSizeLabel(product.rental_size_label || "");
        setRentalPropertyType(product.rental_property_type || "");
        setRentalStatus(product.rental_status === "reserved" || product.rental_status === "rented" ? product.rental_status : "available");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load product editor.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [productId]);

  const selectedCategory = categories.find((category) => category.id === categoryId);
  const availableSubcategories = selectedCategory ? getCategoryMerchandising(selectedCategory.slug).subcategories : [];

  function changeCategory(value: string) {
    setCategoryId(value);
    const category = categories.find((item) => item.id === value);
    const firstCollection = category ? getCategoryMerchandising(category.slug).subcategories[0]?.slug ?? "" : "";
    setSubcategorySlug(firstCollection);
  }

  function changeName(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const valid = selected.filter((file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024);
    if (valid.length !== selected.length) setMessage("Only image files up to 10 MB each can be uploaded.");
    setFiles((current) => [...current, ...valid].slice(0, Math.max(0, 6 - imageUrls.length)));
    event.target.value = "";
  }

  function updateVariant(key: string, field: "name" | "priceDelta" | "stockQty", value: string) {
    setVariants((current) => current.map((variant) => variant.key === key ? {
      ...variant,
      [field]: field === "name" ? value : Math.max(0, Number(value) || 0),
    } : variant));
  }

  async function uploadImages() {
    if (!files.length) return [];
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error("Your owner session has expired.");

    const uploaded: string[] = [];
    for (const file of files) {
      const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      const path = `${data.user.id}/${Date.now()}-${crypto.randomUUID()}-${cleanName}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw new Error(`Image upload failed: ${error.message}`);
      const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);
      uploaded.push(publicUrl.publicUrl);
    }
    return uploaded;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name || !slug || !categoryId || !subcategorySlug || !description || variants.some((variant) => !variant.name.trim())) {
      setMessage("Complete every required product field and option.");
      return;
    }
    if (!imageUrls.length && !files.length) {
      setMessage("Upload at least one product image.");
      return;
    }

    setSaving(true);
    setMessage(files.length ? "Uploading product images…" : "Saving product…");
    try {
      const uploaded = await uploadImages();
      const payload = {
        name,
        slug,
        categoryId,
        subcategorySlug,
        description,
        price,
        imageUrls: [...imageUrls, ...uploaded].slice(0, 6),
        isFeatured,
        isActive,
        variants: variants.map((variant) => ({ name: variant.name, priceDelta: variant.priceDelta, stockQty: variant.stockQty })),
        rentalBedrooms: rentalBedrooms.trim() === "" ? null : Math.max(0, Math.floor(Number(rentalBedrooms) || 0)),
        rentalBathrooms: rentalBathrooms.trim() === "" ? null : Math.max(0, Math.floor(Number(rentalBathrooms) || 0)),
        rentalLocation: rentalLocation.trim() || null,
        rentalSizeLabel: rentalSizeLabel.trim() || null,
        rentalPropertyType: rentalPropertyType.trim() || null,
        rentalStatus: subcategorySlug === "houses-for-rent" ? rentalStatus : null,
      };
      await ownerFetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
        method: productId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-loading-panel"><span className="admin-spinner" /><p>Loading product editor…</p></div>;

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading">
        <div><p className="wa-eyebrow">{editing ? "EDIT PRODUCT" : "NEW PRODUCT"}</p><h1>{editing ? "Update product" : "Add a product"}</h1><p>Changes are stored in Supabase and appear on the customer website after publishing.</p></div>
        <Link className="button-secondary" href="/admin/products">Back to Products</Link>
      </div>

      {message ? <div className="admin-alert">{message}</div> : null}
      <form className="admin-product-form" onSubmit={submit}>
        <div className="admin-form-main">
          <section className="admin-form-card">
            <div className="admin-form-card-heading"><span>01</span><div><h2>Product information</h2><p>The main details customers will see.</p></div></div>
            <div className="admin-field-grid">
              <label className="wide">Product name<input className="input-field" value={name} onChange={(event) => changeName(event.target.value)} required /></label>
              <label>Product URL slug<input className="input-field" value={slug} onChange={(event) => { setSlugTouched(true); setSlug(slugify(event.target.value)); }} required /><small>/product/{slug || "product-name"}</small></label>
              <label>Category<select className="input-field" value={categoryId} onChange={(event) => changeCategory(event.target.value)} required>{categories.map((category) => <option value={category.id} key={category.id}>{getAdminCategoryLabel(category)}</option>)}</select></label>
              <label>Product collection<select className="input-field" value={subcategorySlug} onChange={(event) => setSubcategorySlug(event.target.value)} required><option value="" disabled>Select collection</option>{availableSubcategories.map((item) => <option value={item.slug} key={item.slug}>{item.label}</option>)}</select><small>This decides which collection page displays the product.</small></label>
              <label>Base price ({STORE_CURRENCY})<input className="input-field" type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(Math.max(0, Number(event.target.value) || 0))} required /></label>
              <label className="wide">Description<textarea className="input-field admin-textarea" rows={6} value={description} onChange={(event) => setDescription(event.target.value)} required /></label>
            </div>
          </section>

          <section className="admin-form-card">
            <div className="admin-form-card-heading"><span>02</span><div><h2>Product images</h2><p>Upload up to six JPG, PNG, WebP, or AVIF images.</p></div></div>
            <div className="admin-image-grid">
              {imageUrls.map((url) => <div className="admin-image-preview" key={url}><Image src={url} alt="Product" width={180} height={180} unoptimized={url.startsWith("http")} /><button type="button" aria-label="Remove image" onClick={() => setImageUrls((current) => current.filter((item) => item !== url))}><TrashIcon size={17} /></button></div>)}
              {files.map((file, index) => <div className="admin-file-preview" key={`${file.name}-${index}`}><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(1)} MB</small><button type="button" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}
              {imageUrls.length + files.length < 6 ? <label className="admin-upload-box"><PlusIcon size={24} /><strong>Upload images</strong><span>Maximum 10 MB each</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={selectFiles} /></label> : null}
            </div>
          </section>

          <section className="admin-form-card">
            <div className="admin-form-card-heading"><span>03</span><div><h2>Options and stock</h2><p>Add sizes, colours, bundles, or a single Standard option.</p></div></div>
            <div className="admin-variant-list">
              {variants.map((variant, index) => <div className="admin-variant-row" key={variant.key}><label>Option name<input className="input-field" value={variant.name} onChange={(event) => updateVariant(variant.key, "name", event.target.value)} placeholder="Standard, Large, Black…" required /></label><label>Price adjustment ({STORE_CURRENCY})<input className="input-field" type="number" min="0" step="0.01" value={variant.priceDelta} onChange={(event) => updateVariant(variant.key, "priceDelta", event.target.value)} /></label><label>Stock quantity<input className="input-field" type="number" min="0" step="1" value={variant.stockQty} onChange={(event) => updateVariant(variant.key, "stockQty", event.target.value)} /></label><button type="button" aria-label={`Remove option ${index + 1}`} disabled={variants.length === 1} onClick={() => setVariants((current) => current.filter((item) => item.key !== variant.key))}><TrashIcon size={18} /></button></div>)}
            </div>
            <button className="admin-add-option" type="button" onClick={() => setVariants((current) => [...current, { key: crypto.randomUUID(), name: "", priceDelta: 0, stockQty: 0 }])}><PlusIcon size={17} /> Add another option</button>
          </section>

          {subcategorySlug === "houses-for-rent" ? (
            <section className="admin-form-card">
              <div className="admin-form-card-heading"><span>04</span><div><h2>Rental details</h2><p>Shown as labeled fields on the listing page, in addition to the description.</p></div></div>
              <div className="admin-field-grid">
                <label>Bedrooms<input className="input-field" type="number" min="0" step="1" value={rentalBedrooms} onChange={(event) => setRentalBedrooms(event.target.value)} placeholder="3" /></label>
                <label>Bathrooms<input className="input-field" type="number" min="0" step="1" value={rentalBathrooms} onChange={(event) => setRentalBathrooms(event.target.value)} placeholder="2" /></label>
                <label>Property type<input className="input-field" value={rentalPropertyType} onChange={(event) => setRentalPropertyType(event.target.value)} placeholder="Duplex, Bungalow, Studio, Flat, Mansion…" /></label>
                <label>Size<input className="input-field" value={rentalSizeLabel} onChange={(event) => setRentalSizeLabel(event.target.value)} placeholder="e.g. 240 sqm" /></label>
                <label className="wide">Location<input className="input-field" value={rentalLocation} onChange={(event) => setRentalLocation(event.target.value)} placeholder="e.g. Lekki Phase 1, Lagos" /></label>
                <label className="wide">Rental availability<select className="input-field" value={rentalStatus} onChange={(event) => setRentalStatus(event.target.value as "available" | "reserved" | "rented")}><option value="available">Available</option><option value="reserved">Reserved</option><option value="rented">Rented</option></select><small>Reserved and rented properties cannot be checked out. A successful payment also makes stock zero, which displays as Rented.</small></label>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="admin-form-side">
          <section className="admin-form-card admin-publish-card">
            <h2>Publishing</h2>
            <label className="admin-toggle-row"><span><strong>Published</strong><small>Visible and purchasable in the customer store.</small></span><input type="checkbox" checked={isActive} onChange={(event) => setActive(event.target.checked)} /></label>
            <label className="admin-toggle-row"><span><strong>Featured product</strong><small>Eligible for the six-product home section.</small></span><input type="checkbox" checked={isFeatured} onChange={(event) => setFeatured(event.target.checked)} /></label>
            <div className="admin-stock-total"><span>Total stock</span><strong>{variants.reduce((sum, variant) => sum + Number(variant.stockQty), 0)}</strong></div>
            <button className="button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save Changes" : "Publish Product"}</button>
            <Link className="button-secondary" href="/admin/products">Cancel</Link>
          </section>
        </aside>
      </form>
    </div>
  );
}
