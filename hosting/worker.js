const HTML_HEADERS = {
  "cache-control": "public, max-age=0, must-revalidate",
  "content-type": "text/html; charset=utf-8",
};

function withHtmlHeaders(response) {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(HTML_HEADERS)) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export default {
  async fetch(request, env) {
    if (!env.ASSETS) {
      return new Response("Static asset binding is unavailable.", { status: 500 });
    }

    const url = new URL(request.url);
    const directResponse = await env.ASSETS.fetch(request);

    if (directResponse.status !== 404 || url.pathname.includes(".")) {
      return directResponse;
    }

    const routePath = url.pathname === "/"
      ? "/index.html"
      : `${url.pathname.replace(/\/$/, "")}.html`;
    const routeUrl = new URL(routePath, url.origin);
    const routeRequest = new Request(routeUrl, request);
    const routeResponse = await env.ASSETS.fetch(routeRequest);

    if (routeResponse.status !== 404) {
      return withHtmlHeaders(routeResponse);
    }

    const notFoundUrl = new URL("/+not-found.html", url.origin);
    return withHtmlHeaders(await env.ASSETS.fetch(new Request(notFoundUrl, request)));
  },
};
