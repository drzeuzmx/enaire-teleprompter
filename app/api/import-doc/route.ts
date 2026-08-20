import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function extractDocId(input: string): string | null {
  const trimmed = input.trim();
  // Accept a bare ID as well as a full URL.
  const idOnly = /^[a-zA-Z0-9_-]{20,}$/;
  if (idOnly.test(trimmed)) return trimmed;
  const match = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const url = body.url || "";
  const docId = extractDocId(url);

  if (!docId) {
    return NextResponse.json(
      { error: "No pude reconocer ese link de Google Docs. Revisa que sea un link de documento válido." },
      { status: 400 }
    );
  }

  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;

  try {
    const res = await fetch(exportUrl, { redirect: "follow" });

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json(
        {
          error:
            'Este documento no es público. En Google Docs, abre "Compartir" y cambia el acceso a "Cualquier persona con el enlace" como Lector.',
        },
        { status: 403 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "No pude descargar el documento. Verifica el link e inténtalo de nuevo." },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    // Google redirects unauthenticated/blocked requests to an HTML sign-in
    // page instead of a real 403 in some cases -- catch that here too.
    if (contentType.includes("text/html")) {
      return NextResponse.json(
        {
          error:
            'Este documento no es público. En Google Docs, abre "Compartir" y cambia el acceso a "Cualquier persona con el enlace" como Lector.',
        },
        { status: 403 }
      );
    }

    let title = "Documento importado";
    try {
      const metaRes = await fetch(
        `https://docs.google.com/document/d/${docId}/mobilebasic`
      );
      const metaHtml = await metaRes.text();
      const titleMatch = metaHtml.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(/\s*-\s*Google Docs\s*$/i, "").trim() || title;
      }
    } catch {
      // title is a nice-to-have; ignore failures
    }

    return NextResponse.json({ text, title, docId });
  } catch {
    return NextResponse.json(
      { error: "No pude conectar con Google Docs. Intenta de nuevo en un momento." },
      { status: 502 }
    );
  }
}
