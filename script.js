// Mock data for when RSS feeds fail - only used as last resort
const MOCK_DATA = {
    payments: [
        {
            title: "Digital Payment Innovations Transforming Commerce",
            description: "How new payment technologies are revolutionizing the way businesses and consumers transact in the digital economy.",
            link: "#",
            pubDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            imageUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            source: "Payment Innovation Today"
        },
        {
            title: "Regulatory Changes Impact Payment Processing",
            description: "Analysis of new regulations affecting payment processors and their impact on merchant services worldwide.",
            link: "#",
            pubDate: new Date(Date.now() - 172800000).toISOString(), // Two days ago
            imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            source: "Financial Compliance Report"
        }
    ],
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

// RSS feed URLs by category
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
const navItems = document.querySelectorAll('.nav-item');
const chips = document.querySelectorAll('.chip');
const articlesContainer = document.getElementById('articles-container');

// State management
let currentState = {
    activeSection: 'payments',
    activeTopic: 'all',
    allArticles: {},
    filteredArticles: []
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupNavigation();
    setupTopicSelector();
    loadSectionData(currentState.activeSection);
}

// Set up bottom navigation
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const section = item.getAttribute('data-section');
            
            // Add haptic feedback
            item.classList.add('haptic-feedback');
            setTimeout(() => item.classList.remove('haptic-feedback'), 200);
            
            if (section === 'external') {
                // Handle external link by replacing current page as requested
                window.location.href = 'https://kindgirls.com/r.php';
                return;
            }
            
            // Update active states
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update state and load data
            currentState.activeSection = section;
            loadSectionData(section);
        });
    });
}

// Set up topic selector
function setupTopicSelector() {
    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            const topic = chip.getAttribute('data-topic');
            
            // Add haptic feedback
            chip.classList.add('haptic-feedback');
            setTimeout(() => chip.classList.remove('haptic-feedback'), 200);
            
            // Update active states
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            // Update state and filter data
            currentState.activeTopic = topic;
            filterArticles();
        });
    });
}

// Load data for a specific section
async function loadSectionData(section) {
    if (section === 'external') return;
    
    // Show loading state
    showLoading();
    
    try {
        const articles = await fetchFeedsForTab(section);
        
        // Store articles in state
        currentState.allArticles[section] = articles;
        
        // Filter and display articles
        filterArticles();
    } catch (error) {
        console.error(`Error loading ${section} feeds:`, error);
        // Show error message or mock data
        const mockData = MOCK_DATA[section] || [];
        currentState.allArticles[section] = mockData;
        filterArticles();
    }
}

// Filter articles based on current topic
function filterArticles() {
    const section = currentState.activeSection;
    const topic = currentState.activeTopic;
    
    let articles = currentState.allArticles[section] || [];
    
    // Apply topic filter (simplified - in a real app this would be more complex)
    if (topic !== 'all') {
        // For demo purposes, we'll just use the articles as-is
        // In a real implementation, this would filter by specific topics within the section
    }
    
    currentState.filteredArticles = articles;
    displayArticles(articles);
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
function displayArticles(articles) {
    if (articles.length === 0) {
        articlesContainer.innerHTML = '<div class="no-articles">No articles found in the feeds. Feeds may be temporarily unavailable, restricted, or the content may have moved. Please try again later.</div>';
        return;
    }
    
    articlesContainer.innerHTML = articles.map(article => createArticleElement(article)).join('');
    
    // Add tap and long press interactions
    addArticleInteractions();
}

// Create article element HTML
function createArticleElement(article) {
    const pubDate = new Date(article.pubDate);
    const formattedDate = pubDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    return `
        <div class="article-card" data-article-id="${article.link}">
            ${article.imageUrl ? `
                <div class="article-image">
                    <img src="${article.imageUrl}" alt="${article.title}" onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #e6e6e6, #f0f0f0)'; this.parentElement.innerHTML='<span class=\'no-image-text\'>📰 No Image Available</span>';">
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
                <p class="article-excerpt">${article.description.substring(0, 180)}${article.description.length > 180 ? '...' : ''}</p>
            </div>
        </div>
    `;
}

// Add tap and long press interactions to articles
function addArticleInteractions() {
    const articleCards = document.querySelectorAll('.article-card');
    
    articleCards.forEach(card => {
        // Tap interaction - simulate navigation to article
        card.addEventListener('click', (e) => {
            if (e.target.tagName !== 'A') { // Don't interfere with link clicks
                const link = card.querySelector('a');
                if (link) {
                    window.open(link.href, '_blank');
                }
            }
        });
        
        // Long press interaction - show quick actions
        let pressTimer;
        card.addEventListener('touchstart', (e) => {
            pressTimer = window.setTimeout(() => {
                showQuickActions(card);
            }, 500); // 500ms for long press
        });
        
        card.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
        
        card.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    });
}

// Show quick actions for an article
function showQuickActions(card) {
    const articleTitle = card.querySelector('.article-title a').textContent;
    const articleLink = card.querySelector('.article-title a').href;
    
    // In a real app, this would show a bottom sheet with actions
    // For now, we'll just show a simple alert
    const action = prompt(`Actions for "${articleTitle}":\n\n1. Save\n2. Share\n3. Mark as Read\n\nEnter action number:`);
    
    if (action === '2') {
        // Share action
        if (navigator.share) {
            navigator.share({
                title: articleTitle,
                url: articleLink
            }).catch(console.error);
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(articleLink);
            alert('Link copied to clipboard!');
        }
    }
}

// Show loading state
function showLoading() {
    articlesContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading articles...</p>
        </div>
    `;
}

// Add pull-to-refresh functionality
function setupPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    document.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentY = e.touches[0].clientY;
        const diffY = currentY - startY;
        
        if (diffY > 0 && window.scrollY <= 0) {
            // Pull down logic here
            e.preventDefault();
        }
    });
    
    document.addEventListener('touchend', () => {
        if (isDragging && (currentY - startY) > 100) {
            // Refresh the current section
            loadSectionData(currentState.activeSection);
        }
        isDragging = false;
    });
}

// Initialize pull to refresh
setupPullToRefresh();