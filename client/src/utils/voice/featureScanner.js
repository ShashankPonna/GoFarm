/**
 * Feature Scanner
 * Automatically detects and memorizes all features from navigation links
 * Creates a dynamic command map for voice navigation
 */

class FeatureScanner {
  constructor() {
    this.features = []; // Array of feature objects
    this.commandMap = {}; // Map of command names to routes
    this.scanned = false;
  }

  /**
   * Scan all navigation links and build feature database
   * Call this after the DOM is fully loaded (e.g., useEffect with []dependency)
   */
  scanFeatures() {
    console.log('[Voice] Scanning for navigation features...');
    
    this.features = [];
    const seen = new Set(); // Track seen routes to avoid duplicates

    // Get all links from the page
    const links = document.querySelectorAll('a[href*="/"]');

    links.forEach((link) => {
      const text = link.textContent.trim();
      const href = link.getAttribute('href');

      // Skip if no valid text or href, or if internal link
      if (!text || !href || href.startsWith('#') || seen.has(href)) {
        return;
      }

      // Skip common non-feature links
      if (this.isNonFeatureLink(text, href)) {
        return;
      }

      seen.add(href);

      // Create feature object
      const feature = {
        name: text,
        route: href,
        keywords: this.generateKeywords(text),
        normalized: text.toLowerCase().replace(/\s+/g, ' '),
      };

      this.features.push(feature);
      console.log('[Voice] Found feature:', feature.name, '→', feature.route);
    });

    // Build command map for faster lookups
    this.buildCommandMap();
    this.scanned = true;
    console.log('[Voice] Feature scan complete. Found', this.features.length, 'features');

    return this.features;
  }

  /**
   * Check if link should be excluded from feature list
   */
  isNonFeatureLink(text, href) {
    const excluded = [
      'home',
      'login',
      'register',
      'logout',
      'profile',
      'user',
      'account',
      'settings',
      'privacy',
      'terms',
      'about',
      'contact',
      'help',
      'search',
      'language',
      'theme',
      'dark',
      'light',
    ];

    const lowerText = text.toLowerCase();
    return excluded.some(word => lowerText.includes(word));
  }

  /**
   * Generate keywords from feature name
   * E.g., "Crop Recommendation" → ["crop", "recommendation", "crop recommendation", "recommend crop"]
   */
  generateKeywords(text) {
    const words = text.toLowerCase().split(/\s+/);
    const keywords = new Set();

    // Add individual words
    words.forEach(word => keywords.add(word));

    // Add full phrase
    keywords.add(words.join(' '));

    // Add variations
    if (words.length === 2) {
      keywords.add(words.reverse().join(' ')); // Reversed order
    }

    // Add abbreviations (first letter of each word)
    if (words.length > 1) {
      const abbr = words.map(w => w[0]).join('');
      keywords.add(abbr);
    }

    return Array.from(keywords);
  }

  /**
   * Build quick lookup map
   */
  buildCommandMap() {
    this.commandMap = {};

    this.features.forEach((feature) => {
      feature.keywords.forEach((keyword) => {
        if (!this.commandMap[keyword]) {
          this.commandMap[keyword] = [];
        }
        this.commandMap[keyword].push(feature);
      });
    });

    console.log('[Voice] Command map built with', Object.keys(this.commandMap).length, 'keywords');
  }

  /**
   * Match user input against features
   * Returns best matching feature(s)
   */
  matchFeature(input) {
    if (!input) return null;

    const lowerInput = input.toLowerCase().trim();
    const words = lowerInput.split(/\s+/);

    // Try exact match first
    let match = this.commandMap[lowerInput];
    if (match && match.length > 0) {
      return match[0]; // Return first match
    }

    // Try individual words
    for (let word of words) {
      match = this.commandMap[word];
      if (match && match.length > 0) {
        return match[0];
      }
    }

    // Try fuzzy matching (check if input contains feature keywords)
    for (let feature of this.features) {
      for (let keyword of feature.keywords) {
        if (lowerInput.includes(keyword) && keyword.length > 1) {
          return feature;
        }
      }
    }

    return null;
  }

  /**
   * Get all features
   */
  getFeatures() {
    return this.features;
  }

  /**
   * Get feature by route
   */
  getFeatureByRoute(route) {
    return this.features.find(f => f.route === route);
  }

  /**
   * Get feature by name
   */
  getFeatureByName(name) {
    return this.features.find(f => f.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Force re-scan features (call when navigation changes)
   */
  rescan() {
    this.scanFeatures();
  }

  /**
   * Get scan status
   */
  isScanned() {
    return this.scanned;
  }
}

// Create singleton instance
const featureScanner = new FeatureScanner();

export default featureScanner;
