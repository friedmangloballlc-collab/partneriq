import { useEffect } from "react";

function setMetaTag(selector, attribute, value) {
  let tag = document.querySelector(selector);
  if (tag) {
    tag.setAttribute(attribute, value);
  } else {
    tag = document.createElement("meta");
    const [attr, val] = selector.match(/\[(.+?)="(.+?)"\]/)?.slice(1) || [];
    if (attr && val) tag.setAttribute(attr, val);
    tag.setAttribute(attribute, value);
    document.head.appendChild(tag);
  }
}

export default function SEO({ title, description, ogTitle, ogDescription, ogImage, canonical }) {
  useEffect(() => {
    const prevTitle = document.title;
    const baseTitle = "DealStage";
    document.title = title ? `${title} | ${baseTitle}` : `${baseTitle} — AI Partnership Intelligence Platform`;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content");
    if (metaDesc && description) {
      metaDesc.setAttribute("content", description);
    }

    // Update OG tags
    const effectiveTitle = ogTitle || title || "";
    const effectiveDesc = ogDescription || description || "";

    if (effectiveTitle) {
      setMetaTag('meta[property="og:title"]', "content", effectiveTitle);
      setMetaTag('meta[name="twitter:title"]', "content", effectiveTitle);
    }
    if (effectiveDesc) {
      setMetaTag('meta[property="og:description"]', "content", effectiveDesc);
      setMetaTag('meta[name="twitter:description"]', "content", effectiveDesc);
    }
    if (ogImage) {
      setMetaTag('meta[property="og:image"]', "content", ogImage);
      setMetaTag('meta[name="twitter:image"]', "content", ogImage);
    }

    // Update canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (link) {
        link.setAttribute("href", canonical);
      }
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) metaDesc.setAttribute("content", prevDesc);
    };
  }, [title, description, ogTitle, ogDescription, ogImage, canonical]);

  return null;
}
