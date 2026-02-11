// Mock data for when RSS feeds fail - only used as last resort
const MOCK_DATA = {
    crypto: [
        {
            title: "Bitcoin's Role in Institutional Investment",
            description: "Major financial institutions increasingly adopt Bitcoin as part of their treasury strategy.",
            link: "#",
            pubDate: new Date(Date.now() - 86400000).toISOString(),
            imageUrl: "https://images.unsplash.com/photo-1611974789891-3a2d757b3bfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            source: "Crypto Market Watch"
        },
        {
            title: "Ethereum 2.0: The Future of Smart Contracts",
            description: "Analysis of Ethereum's transition to proof-of-stake and its implications for decentralized applications.",
            link: "#",
            pubDate: new Date(Date.now() - 172800000).toISOString(),
            imageUrl: "https://images.unsplash.com/photo-1622837707362-9a0a89f3a4d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            source: "Blockchain Research"
        }
    ],
    portugal: [
        {
            title: "Portugal's Digital Transformation Initiative",
            description: "Government launches new digital infrastructure projects to boost tech sector growth.",
            link: "#",
            pubDate: new Date(Date.now() - 86400000).toISOString(),
            imageUrl: "https://images.unsplash.com/photo-1531102946758-9b6f0d511e6a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            source: "Portuguese Business Journal"
        },
        {
            title: "Tourism Recovery Shows Strong Momentum",
            description: "International visitors return to Portugal at record levels as hospitality sector rebounds.",
            link: "#",
            pubDate: new Date(Date.now() - 172800000).toISOString(),
            imageUrl: "https://images.unsplash.com/photo-1534438327276-14e530049888?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            source: "Lisbon Times"
        }
    ]
};

// RSS feed URLs by category - focusing on reliable payments feeds
const RSS_FEEDS = {
    payments: [
        'https://www.pymnts.com/feed/',
        'https://fintech.global/feed/',
        'https://www.finextra.com/rss.aspx'
    ],
    crypto: [
        'https://bitcoinmagazine.com/feed',
        'https://www.coindesk.com/feed',
        'https://cointelegraph.com/feed',
        'https://blockchain.news/rss.xml',
        'https://decrypt.co/feed'
    ],
    portugal: [
        'https://feeds.lusa.pt/lusa',
        'https://www.publico.pt/rss',
        'https://expresso.sapo.pt/feed',
        'https://www.rtp.pt/noticias/rss/mundo',
        'https://www.jn.pt/rss'
    ]
};

// Alternative CORS proxies to try if the main one fails
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/',
    'https://api.codetabs.com/v1/proxy/?quest='
];

// DOM elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    setupTabNavigation();
    loadActiveTabContent();
    
    // Set up direct navigation for external tab
    setupExternalTabNavigation();
});

// Set up direct navigation for external tab
function setupExternalTabNavigation() {
    const externalTabBtn = document.querySelector('[data-tab="external"]');
    if (externalTabBtn) {
        externalTabBtn.addEventListener('click', () => {
            window.open('https://kindgirls.com/r.php', '_blank');
        });
    }
}

// Set up tab navigation
function setupTabNavigation() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Don't redirect for external tab, just activate it normally
            if (btn.getAttribute('data-tab') === 'external') {
                e.preventDefault();
                return; // Allow the regular tab switching to occur
            }
            
            const tabId = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                    
                    // Load content if it hasn't been loaded yet
                    if (!content.dataset.loaded) {
                        loadTabContent(tabId);
                        content.dataset.loaded = 'true';
                    }
                }
            });
        });
    });
}

// Load content for the initially active tab
function loadActiveTabContent() {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && activeTab.id !== 'external') {
        loadTabContent(activeTab.id);
        activeTab.dataset.loaded = 'true';
    } else if (activeTab && activeTab.id === 'external') {
        // For external tab, set as loaded without loading content
        activeTab.dataset.loaded = 'true';
    }
}

// Load content for a specific tab
function loadTabContent(tabId) {
    if (tabId === 'external') return; // External tab doesn't need RSS loading
    
    const container = document.getElementById(`${tabId}-articles`);
    
    // Show loading state
    showLoading(container);
    
    // Fetch and display feeds for this tab
    fetchFeedsForTab(tabId)
        .then(articles => {
            // Only use mock data if absolutely no real articles found AND it's a category that has mock data
            if (articles.length === 0 && tabId !== 'payments' && MOCK_DATA[tabId]) {
                displayArticles(container, MOCK_DATA[tabId]);
            } else {
                displayArticles(container, articles);
            }
        })
        .catch(error => {
            console.error(`Error loading ${tabId} feeds:`, error);
            // For payments, never use mock data - always try to show whatever real data we could get
            if (tabId === 'payments') {
                displayArticles(container, []); // Show no articles message instead of mock data
            } else if (MOCK_DATA[tabId]) {
                displayArticles(container, MOCK_DATA[tabId]);
            } else {
                displayArticles(container, []); // Show no articles message
            }
        });
}

// Fetch feeds for a specific tab with multiple proxy fallback
async function fetchFeedsForTab(tabId) {
    const feeds = RSS_FEEDS[tabId] || [];
    const allArticles = [];
    
    // Try each feed URL
    for (const feedUrl of feeds) {
        try {
            const articles = await fetchFeedWithProxyFallback(feedUrl);
            if (articles.length > 0) {
                allArticles.push(...articles);
                console.log(`Successfully fetched ${articles.length} articles from ${feedUrl}`); // Debug logging
            } else {
                console.log(`No articles found in feed: ${feedUrl}`); // Debug logging
            }
        } catch (err) {
            console.warn(`Failed to fetch ${feedUrl} after all proxy attempts:`, err);
            // Continue to next feed URL
        }
    }
    
    // Sort by date (newest first) and limit to 20 articles
    return allArticles
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .slice(0, 20);
}

// Fetch a single RSS feed trying multiple CORS proxies
async function fetchFeedWithProxyFallback(feedUrl) {
    for (const proxyUrl of CORS_PROXIES) {
        try {
            const fullUrl = proxyUrl + encodeURIComponent(feedUrl);
            const response = await fetch(fullUrl, {
                headers: {
                    'Accept': 'application/xml, text/xml, */*',
                    'Content-Type': 'text/xml'
                },
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const xmlText = await response.text();
            
            // Parse the XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Check for parsing errors
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('XML parsing failed');
            }
            
            // Extract articles
            const items = xmlDoc.querySelectorAll('item');
            const articles = [];
            
            items.forEach(item => {
                const title = item.querySelector('title')?.textContent || 'No Title';
                const description = item.querySelector('description')?.textContent || '';
                const link = item.querySelector('link')?.textContent || '#';
                const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
                const enclosure = item.querySelector('enclosure');
                let imageUrl = '';
                
                // Try to get image from media:thumbnail
                const thumbnail = item.querySelector('media\\:thumbnail, thumbnail');
                if (thumbnail && thumbnail.getAttribute('url')) {
                    imageUrl = thumbnail.getAttribute('url');
                }
                
                // Try to get image from content:encoded or description
                if (!imageUrl) {
                    const contentEncoded = item.querySelector('content\\:encoded, encoded');
                    if (contentEncoded) {
                        imageUrl = extractImageFromHTML(contentEncoded.textContent);
                    }
                }
                
                if (!imageUrl) {
                    imageUrl = extractImageFromHTML(description);
                }
                
                // If no image found in enclosures, try to get from media:content
                if (!imageUrl && enclosure && enclosure.getAttribute('url')) {
                    const enclosureUrl = enclosure.getAttribute('url');
                    const enclosureType = enclosure.getAttribute('type') || '';
                    if (enclosureType.startsWith('image/')) {
                        imageUrl = enclosureUrl;
                    }
                }
                
                articles.push({
                    title: stripHtml(title),
                    description: stripHtml(description),
                    link: link,
                    pubDate: pubDate,
                    imageUrl: imageUrl,
                    source: new URL(feedUrl).hostname
                });
            });
            
            console.log(`Parsed ${articles.length} articles from ${feedUrl}`); // Debug logging
            
            // If we successfully parsed the feed, return the articles
            if (articles.length > 0) {
                return articles;
            }
        } catch (error) {
            console.warn(`Proxy ${proxyUrl} failed for ${feedUrl}:`, error.message);
            // Continue to next proxy
        }
    }
    
    // If all proxies failed, return empty array
    return [];
}

// Helper function to extract image from HTML content
function extractImageFromHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const img = tempDiv.querySelector('img');
    if (img && img.src) {
        return img.src;
    }
    
    // Look for image URLs in the HTML
    const imgRegex = /<img[^>]+src="(https?:\/\/[^">]+)"/gi;
    const match = imgRegex.exec(html);
    if (match) {
        return match[1];
    }
    
    return '';
}

// Helper function to strip HTML tags
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Display articles in the container
function displayArticles(container, articles) {
    if (articles.length === 0) {
        container.innerHTML = '<div class="no-articles">No articles found in the feeds. Feeds may be temporarily unavailable, restricted, or the content may have moved. Please try again later.</div>';
        return;
    }
    
    container.innerHTML = articles.map(article => createArticleElement(article)).join('');
}

// Create article element HTML
function createArticleElement(article) {
    const pubDate = new Date(article.pubDate);
    const formattedDate = pubDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
        <div class="article-card">
            ${article.imageUrl ? `
                <div class="article-image">
                    <img src="${article.imageUrl}" alt="${article.title}" onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #2c3e50, #34495e)'; this.parentElement.innerHTML='<span class=\'no-image-text\'>📰 No Image Available</span>';">
                </div>
            ` : ''}
            <div class="article-header">
                <h3 class="article-title">
                    <a href="${article.link}" target="_blank">${article.title}</a>
                </h3>
                <div class="article-meta">
                    <span class="article-date">${formattedDate}</span>
                    <span class="article-source">${article.source}</span>
                </div>
                <p class="article-excerpt">${article.description.substring(0, 200)}${article.description.length > 200 ? '...' : ''}</p>
            </div>
        </div>
    `;
}

// Show loading state
function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading articles...</p>
        </div>
    `;
}

// Add smooth scrolling for better UX on mobile
if ('scrollBehavior' in document.documentElement.style) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}