import { useEffect } from "react";

export default function SEO({ title, description }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | Dealstage` : "Dealstage — AI Partnership Intelligence Platform";

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content");
    if (metaDesc && description) {
      metaDesc.setAttribute("content", description);
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) metaDesc.setAttribute("content", prevDesc);
    };
  }, [title, description]);

  return null;
}
