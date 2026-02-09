export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const client_id = env.GITHUB_CLIENT_ID;
  const client_secret = env.GITHUB_CLIENT_SECRET;

  // Step 2: GitHub returned with code
  if (url.searchParams.get("code")) {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code: url.searchParams.get("code")
      })
    });

    const data = await tokenRes.json();

    return new Response(`
      <script>
        window.opener.postMessage(
          'authorization:github:success:' + '${data.access_token}',
          window.location.origin
        );
        window.close();
      </script>
    `, { headers: { "Content-Type": "text/html" }});
  }

  // Step 1: Redirect to GitHub login
  return Response.redirect(
    "https://github.com/login/oauth/authorize?client_id=" + client_id + "&scope=repo"
  );
}
