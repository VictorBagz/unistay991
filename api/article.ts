

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { articleId } = req.query;

  // If no article ID, redirect to home
  if (!articleId || typeof articleId !== 'string') {
    return res.redirect(302, '/');
  }

  try {
    // Fetch article from Supabase
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/news?id=eq.${articleId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return res.redirect(302, '/');
    }

    const data = await response.json();
    const article = data[0];

    // If article not found, redirect to home
    if (!article) {
      return res.redirect(302, '/');
    }

    // Prepare meta tag content
    const imageUrl = article.imageUrl.replace('/100/100', '/800/600');
    const description = article.description
      .substring(0, 200)
      .replace(/"/g, '&quot;')
      .replace(/\n/g, ' ')
      .trim();
    const title = article.title.replace(/"/g, '&quot;');
    const articleUrl = `https://${req.headers.host}/article/${articleId}`;

    // Generate HTML with proper meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} - UniStay</title>
    <link rel="icon" type="image/png" href="${imageUrl}" />
    <link rel="apple-touch-icon" href="${imageUrl}" />
    
    <!-- Open Graph Meta Tags for Social Sharing -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="800" />
    <meta property="og:image:height" content="600" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:site_name" content="UniStay" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    
    <!-- Standard Meta Tags -->
    <meta name="description" content="${description}" />
    
    <!-- Redirect to React app -->
    <meta http-equiv="refresh" content="0;url=/?view=newsArticle&articleId=${articleId}" />
    
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #ffff8c;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
      }
      .loader {
        text-align: center;
        color: #0A2540;
      }
      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #0A2540;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
    
    <script>
      // Immediate redirect for users (crawlers will still see meta tags)
      window.location.href = '/?view=newsArticle&articleId=${articleId}';
    </script>
</head>
<body>
    <div class="loader">
        <div class="spinner"></div>
        <h2>Loading article...</h2>
        <p>If you're not redirected, <a href="/?view=newsArticle&articleId=${articleId}" style="color: #0A2540;">click here</a>.</p>
    </div>
</body>
</html>`;

    // Set headers and send response
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('Error fetching article:', error);
    return res.redirect(302, '/');
  }
}