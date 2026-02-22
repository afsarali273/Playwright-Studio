"use strict";
/**
 * Inject Script — JavaScript that is injected into the BrowserView page
 * to capture user interactions and relay them back via the __recorder bridge.
 *
 * This is returned as a string and executed via webContents.executeJavaScript().
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInjectScript = getInjectScript;
function getInjectScript() {
    return `
(function() {
  /* Prevent double-injection */
  if (window.__playwrightRecorderActive) return;
  window.__playwrightRecorderActive = true;

  window.__playwrightInspectorActive = window.__playwrightInspectorActive || false;

  /* ---------------------------------------------------------------- */
  /*  Utility: Generate a unique ID                                    */
  /* ---------------------------------------------------------------- */
  function uid() {
    return 'step_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  /* ---------------------------------------------------------------- */
  /*  Selector Generator — prioritized strategy                        */
  /* ---------------------------------------------------------------- */

  /**
   * Helper to check uniqueness and return the locator with index if needed.
   * @param {string} cssSelector - The CSS selector equivalent to check uniqueness.
   * @param {string} playwrightLocator - The Playwright locator string (e.g. "getByRole(...)").
   * @param {HTMLElement} targetEl - The element we are targeting.
   * @returns {string|null} - The final locator string or null if not suitable.
   */
  function getUniqueLocator(cssSelector, playwrightLocator, targetEl) {
    try {
      const matches = document.querySelectorAll(cssSelector);
      if (matches.length === 0) return null;
      if (matches.length === 1 && matches[0] === targetEl) {
        return playwrightLocator;
      }
      
      // If multiple matches, find index
      for (let i = 0; i < matches.length; i++) {
        if (matches[i] === targetEl) {
          if (i === 0) return playwrightLocator + ".first()";
          return playwrightLocator + ".nth(" + i + ")";
        }
      }
    } catch (e) {
      // Selector might be invalid or complex to check
      return null;
    }
    return null;
  }

  function generateSelector(el) {
    if (!el) return 'html';
    if (el.nodeType === 3) el = el.parentElement; // Text node -> Parent
    if (!el || el === document || el === document.documentElement) return 'html';

    /* 1. data-testid (Priority: High) */
    const testId = el.getAttribute('data-testid') || el.getAttribute('data-test-id');
    if (testId) {
      const loc = getUniqueLocator(
        '[data-testid="' + CSS.escape(testId) + '"]',
        "getByTestId('" + escapeSingle(testId) + "')",
        el
      );
      if (loc) return loc;
    }

    /* 2. Role (Priority: High) */
    const role = el.getAttribute('role') || inferRoleFromTag(el.tagName.toLowerCase());
    const name = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('name') || '').trim();
    if (role && name && name.length < 50) {
       // Best effort approximation for role selector
       // We construct a CSS selector that 'might' match the same elements to check count
       // This is not perfect as Playwright's role engine is much smarter.
       let cssApproximation = '';
       if (role === 'button') cssApproximation = 'button, [role="button"]';
       else if (role === 'link') cssApproximation = 'a, [role="link"]';
       else if (role === 'checkbox') cssApproximation = 'input[type="checkbox"], [role="checkbox"]';
       else if (role === 'radio') cssApproximation = 'input[type="radio"], [role="radio"]';
       else cssApproximation = '[role="' + role + '"]';

       // We can't easily filter by text in querySelectorAll without complex logic.
       // So we query by tag/role, then filter manually by text content.
       try {
         const candidates = Array.from(document.querySelectorAll(cssApproximation));
         const matches = candidates.filter(c => 
           (c.innerText || c.getAttribute('aria-label') || '').trim() === name
         );
         
         if (matches.length > 0) {
            const index = matches.indexOf(el);
            if (index !== -1) {
               const baseLoc = "getByRole('" + escapeSingle(role) + "', { name: '" + escapeSingle(name) + "' })";
               if (matches.length === 1) return baseLoc;
               if (index === 0) return baseLoc + ".first()";
               return baseLoc + ".nth(" + index + ")";
            }
         }
       } catch (e) {}
    }

    /* 3. Placeholder (Priority: Medium) */
    const placeholder = el.getAttribute('placeholder');
    if (placeholder) {
      const loc = getUniqueLocator(
        '[placeholder="' + CSS.escape(placeholder) + '"]',
        "getByPlaceholder('" + escapeSingle(placeholder) + "')",
        el
      );
      if (loc) return loc;
    }

    /* 4. Alt Text (Priority: Medium) */
    const alt = el.getAttribute('alt');
    if (alt) {
      const loc = getUniqueLocator(
        '[alt="' + CSS.escape(alt) + '"]',
        "getByAltText('" + escapeSingle(alt) + "')",
        el
      );
      if (loc) return loc;
    }

    /* 5. Title (Priority: Medium) */
    const title = el.getAttribute('title');
    if (title) {
      const loc = getUniqueLocator(
        '[title="' + CSS.escape(title) + '"]',
        "getByTitle('" + escapeSingle(title) + "')",
        el
      );
      if (loc) return loc;
    }

    /* 6. Label (Priority: Medium) */
    if (el.id) {
       const label = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
       if (label) {
         const labelText = (label.innerText || '').trim();
         if (labelText) {
            // Verify matches for this label text
            const labels = Array.from(document.querySelectorAll('label')).filter(l => l.innerText.trim() === labelText);
            // If multiple labels have same text, we need to know which one maps to our element
            // This is tricky. Simplified: if unique label text, assume unique input.
            if (labels.length === 1) {
               return "getByLabel('" + escapeSingle(labelText) + "')";
            }
         }
       }
    }

    /* 7. Text (Priority: Low) */
    const tagName = (el.tagName || '').toLowerCase();
    const text = (el.innerText || '').trim();
    if (['button', 'a', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'label'].includes(tagName) && text && text.length < 50) {
       // Text match approximation
       // We find all elements with this text
       // XPath is good for exact text match
       const xpath = "//*[text()='" + escapeSingle(text) + "']";
       try {
         const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
         if (result.snapshotLength > 0) {
            for (let i = 0; i < result.snapshotLength; i++) {
               if (result.snapshotItem(i) === el) {
                  const baseLoc = "getByText('" + escapeSingle(text) + "', { exact: true })";
                  if (result.snapshotLength === 1) return baseLoc;
                  if (i === 0) return baseLoc + ".first()";
                  return baseLoc + ".nth(" + i + ")";
               }
            }
         }
       } catch (e) {}
       
       // Fallback for button/link specific text logic if xpath fails or is not preferred
       if (tagName === 'button' || tagName === 'a') {
          const roleType = tagName === 'button' ? 'button' : 'link';
          const baseLoc = "getByRole('" + roleType + "', { name: '" + escapeSingle(text) + "' })";
          // Check count using approximation
          const candidates = Array.from(document.querySelectorAll(tagName));
          const matches = candidates.filter(c => c.innerText.trim() === text);
          const index = matches.indexOf(el);
          if (index !== -1) {
             if (matches.length === 1) return baseLoc;
             if (index === 0) return baseLoc + ".first()";
             return baseLoc + ".nth(" + index + ")";
          }
       }
    }

    /* Fallback 1: ID */
    if (el.id && !/^(ember|react|\\d|:r|_) | (\d{2,})/.test(el.id)) {
       try {
         if (document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) {
           return '#' + CSS.escape(el.id);
         }
       } catch (e) { /* ignore invalid ID */ }
    }

    /* Fallback 2: CSS Path */
    return buildCssPath(el);
  }

  function buildCssPath(el) {
    if (!el || el.nodeType !== 1) return '';
    var path = [];
    var current = el;
    while (current && current !== document.body && current !== document) {
      var tag = (current.tagName || '').toLowerCase();
      if (!tag) break;
      var parent = current.parentElement;
      if (parent) {
        var siblings = Array.from(parent.children).filter(function(c) { return c.tagName === current.tagName; });
        if (siblings.length > 1) {
          var index = siblings.indexOf(current) + 1;
          tag += ':nth-of-type(' + index + ')';
        }
      }
      path.unshift(tag);
      current = parent;
    }
    return path.join(' > ');
  }

  /* ---------------------------------------------------------------- */
  /*  Event Relay                                                      */
  /* ---------------------------------------------------------------- */
  function sendEvent(data) {
    if (window.__recorder && window.__recorder.sendEvent) {
      window.__recorder.sendEvent(data);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Click handler                                                    */
  /* ---------------------------------------------------------------- */
  document.addEventListener('click', function(e) {
    if (window.__playwrightInspectorActive) return;
    try {
      var el = e.target;
      console.log('[Recorder] Click detected on:', el);
      sendEvent({
        id: uid(),
        type: 'click',
        selector: generateSelector(el),
        value: undefined,
        timestamp: Date.now(),
        url: window.location.href,
        tagName: el.tagName ? el.tagName.toLowerCase() : '',
        innerText: (el.innerText || '').slice(0, 100),
        attributes: getAttributes(el),
      });
    } catch (err) {
      console.error('[Recorder] Error in click handler:', err);
    }
  }, true);

  /* ---------------------------------------------------------------- */
  /*  Double-click handler                                             */
  /* ---------------------------------------------------------------- */
  document.addEventListener('dblclick', function(e) {
    if (window.__playwrightInspectorActive) return;
    try {
      var el = e.target;
      sendEvent({
        id: uid(),
        type: 'dblclick',
        selector: generateSelector(el),
        timestamp: Date.now(),
        url: window.location.href,
        tagName: el.tagName ? el.tagName.toLowerCase() : '',
      });
    } catch (err) {
      console.error('[Recorder] Error in dblclick handler:', err);
    }
  }, true);

  /* ---------------------------------------------------------------- */
  /*  Input handler (debounced)                                        */
  /* ---------------------------------------------------------------- */
  var inputTimers = new Map();
  document.addEventListener('input', function(e) {
    if (window.__playwrightInspectorActive) return;
    try {
      var el = e.target;
      var selector = generateSelector(el);

      if (inputTimers.has(selector)) {
        clearTimeout(inputTimers.get(selector));
      }

      inputTimers.set(selector, setTimeout(function() {
        inputTimers.delete(selector);
        sendEvent({
          id: uid(),
          type: 'input',
          selector: selector,
          value: el.value || '',
          timestamp: Date.now(),
          url: window.location.href,
          tagName: el.tagName ? el.tagName.toLowerCase() : '',
        });
      }, 500));
    } catch (err) {
      console.error('[Recorder] Error in input handler:', err);
    }
  }, true);

  /* ---------------------------------------------------------------- */
  /*  Change handler                                                   */
  /* ---------------------------------------------------------------- */
  document.addEventListener('change', function(e) {
    if (window.__playwrightInspectorActive) return;
    try {
      var el = e.target;
      if (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio') {
        var value = el.type === 'checkbox' ? String(el.checked) : el.value;
        var actionType = el.type === 'checkbox'
          ? (el.checked ? 'check' : 'uncheck')
          : (el.tagName === 'SELECT' ? 'select' : 'change');

        sendEvent({
          id: uid(),
          type: actionType,
          selector: generateSelector(el),
          value: value,
          timestamp: Date.now(),
          url: window.location.href,
          tagName: el.tagName ? el.tagName.toLowerCase() : '',
        });
      }
    } catch (err) {
      console.error('[Recorder] Error in change handler:', err);
    }
  }, true);

  /* ---------------------------------------------------------------- */
  /*  Keydown handler (Enter, Escape, Tab)                             */
  /* ---------------------------------------------------------------- */
  document.addEventListener('keydown', function(e) {
    if (window.__playwrightInspectorActive) return;
    try {
      if (['Enter', 'Escape', 'Tab'].includes(e.key)) {
        var el = e.target;
        sendEvent({
          id: uid(),
          type: 'keydown',
          selector: generateSelector(el),
          value: e.key,
          timestamp: Date.now(),
          url: window.location.href,
          tagName: el.tagName ? el.tagName.toLowerCase() : '',
        });
      }
    } catch (err) {
      console.error('[Recorder] Error in keydown handler:', err);
    }
  }, true);

  /* ---------------------------------------------------------------- */
  /*  Helper: Extract element attributes                               */
  /* ---------------------------------------------------------------- */
  function getAttributes(el) {
    if (!el || !el.attributes) return {};
    var attrs = {};
    for (var i = 0; i < el.attributes.length; i++) {
      var attr = el.attributes[i];
      if (['class', 'style', 'data-reactid'].indexOf(attr.name) === -1) {
        attrs[attr.name] = attr.value;
      }
    }
    return attrs;
  }

  /* ---------------------------------------------------------------- */
  /*  Inspector: element highlight and locator generation              */
  /* ---------------------------------------------------------------- */

  var inspectorOverlay = null;
  var inspectorLabel = null;
  var inspectorLastTarget = null;

  function ensureInspectorOverlay() {
    if (inspectorOverlay) return;
    inspectorOverlay = document.createElement('div');
    inspectorOverlay.style.position = 'fixed';
    inspectorOverlay.style.zIndex = '2147483647';
    inspectorOverlay.style.pointerEvents = 'none';
    inspectorOverlay.style.border = '2px solid #a855f7'; // Purple-500
    inspectorOverlay.style.background = 'rgba(168, 85, 247, 0.1)';
    inspectorOverlay.style.borderRadius = '4px';
    inspectorOverlay.style.boxShadow = '0 0 0 1px rgba(88, 28, 135, 0.5), 0 0 15px rgba(168, 85, 247, 0.3)';
    inspectorOverlay.style.transition = 'all 0.06s ease-out';
    inspectorOverlay.style.display = 'none';
    
    // Label for tag name and count
    inspectorLabel = document.createElement('div');
    inspectorLabel.style.position = 'absolute';
    inspectorLabel.style.top = '-26px';
    inspectorLabel.style.left = '-2px';
    inspectorLabel.style.background = '#a855f7';
    inspectorLabel.style.color = 'white';
    inspectorLabel.style.padding = '2px 8px';
    inspectorLabel.style.borderRadius = '4px';
    inspectorLabel.style.fontSize = '12px';
    inspectorLabel.style.fontWeight = '600';
    inspectorLabel.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    inspectorLabel.style.whiteSpace = 'nowrap';
    inspectorLabel.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    inspectorOverlay.appendChild(inspectorLabel);

    document.body.appendChild(inspectorOverlay);
  }

  // Poll for inspector active state to cleanup overlay
  setInterval(function() {
    if (!window.__playwrightInspectorActive && inspectorOverlay) {
        inspectorOverlay.style.display = 'none';
    }
  }, 200);

  function highlightElement(el) {
    ensureInspectorOverlay();
    
    // If inspector is not active or element is invalid, hide overlay
    if (!window.__playwrightInspectorActive || !el || el === document || el === document.documentElement || el === document.body) {
      if (inspectorOverlay) inspectorOverlay.style.display = 'none';
      return;
    }
    
    var rect = el.getBoundingClientRect();
    inspectorOverlay.style.display = 'block';
    inspectorOverlay.style.left = rect.left + 'px';
    inspectorOverlay.style.top = rect.top + 'px';
    inspectorOverlay.style.width = rect.width + 'px';
    inspectorOverlay.style.height = rect.height + 'px';

    // Update label
    var tagName = el.tagName.toLowerCase();
    var id = el.id ? '#' + el.id : '';
    
    // Simple match count approximation using tag name
    var count = document.getElementsByTagName(el.tagName).length;
    
    // Try to get a more specific count based on best locator
    var bestLoc = generateSelector(el);
    var matchInfo = '';
    
    if (bestLoc && bestLoc.includes('nth(')) {
       // Extract index from .nth(i)
       var match = bestLoc.match(/\.nth\((\d+)\)/);
       if (match) {
          var index = parseInt(match[1]) + 1;
          matchInfo = ' | Index: ' + index;
       }
    } else if (bestLoc && bestLoc.includes('.first()')) {
       matchInfo = ' | Index: 1';
    } else {
       // matchInfo = ' | Unique';
    }

    inspectorLabel.innerText = tagName + id + matchInfo;
    
    // Adjust label position if off-screen
    if (rect.top < 26) {
      inspectorLabel.style.top = (rect.height + 4) + 'px';
    } else {
      inspectorLabel.style.top = '-26px';
    }
  }

  function escapeSingle(str) {
    return String(str || '').replace(/'/g, "\\'");
  }

  function inferRoleFromTag(tag) {
    if (!tag) return '';
    if (tag === 'button') return 'button';
    if (tag === 'a') return 'link';
    if (tag === 'input') return 'textbox';
    if (tag === 'select') return 'combobox';
    if (tag === 'img') return 'img';
    if (tag === 'textarea') return 'textbox';
    return '';
  }

  function buildXPath(el) {
    if (!el || el.nodeType !== 1) return '';
    var parts = [];
    var current = el;
    while (current && current.nodeType === 1 && current !== document.documentElement) {
      var ix = 0;
      var siblings = current.parentNode ? current.parentNode.childNodes : [];
      for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i];
        if (sibling.nodeType === 1 && sibling.nodeName === current.nodeName) {
          ix++;
        }
        if (sibling === current) {
          break;
        }
      }
      var segment = current.nodeName.toLowerCase();
      if (ix > 1) {
        segment += '[' + ix + ']';
      }
      parts.unshift(segment);
      current = current.parentNode;
    }
    return '//' + parts.join('/');
  }

  function buildRelativeXPath(el) {
    if (!el || el.nodeType !== 1) return null;
    
    // Helper to get element text safely
    function getText(node) {
      return (node.innerText || node.textContent || '').trim();
    }

    // 1. Check for ID
    if (el.id && !/^(ember|react|\\d|:r|_) | (\d{2,})/.test(el.id)) {
      return "//*[@id='" + el.id + "']";
    }

    // 2. Check for unique attribute
    var uniqueAttrs = ['placeholder', 'aria-label', 'alt', 'title', 'name', 'data-testid', 'data-test-id'];
    for (var i = 0; i < uniqueAttrs.length; i++) {
      var attr = uniqueAttrs[i];
      var val = el.getAttribute(attr);
      if (val) {
        var xpath = "//" + el.tagName.toLowerCase() + "[@" + attr + "='" + val + "']";
        if (document.evaluate("count(" + xpath + ")", document, null, XPathResult.NUMBER_TYPE, null).numberValue === 1) {
          return xpath;
        }
      }
    }

    // 3. Check for text content (contains)
    var text = getText(el);
    if (text && text.length < 50) {
       var xpath = "//" + el.tagName.toLowerCase() + "[contains(text(), '" + text.replace(/'/g, "\\'") + "')]";
       if (document.evaluate("count(" + xpath + ")", document, null, XPathResult.NUMBER_TYPE, null).numberValue === 1) {
         return xpath;
       }
    }

    return null;
  }
  
  // Advanced Relative XPath Generator using Axes
  function buildComplexRelativeXPath(el) {
     if (!el || el.nodeType !== 1) return null;
     
     var tagName = el.tagName.toLowerCase();
     
     // Strategy 1: Preceding Sibling (e.g., Label -> Input)
     var sibling = el.previousElementSibling;
     while(sibling) {
        if (sibling.tagName === 'LABEL' || (sibling.innerText && sibling.innerText.trim().length > 0)) {
           var siblingText = (sibling.innerText || '').trim();
           if (siblingText) {
              var xpath = "//" + sibling.tagName.toLowerCase() + "[contains(., '" + siblingText.replace(/'/g, "\\'") + "')]/following-sibling::" + tagName;
              try {
                  var count = document.evaluate("count(" + xpath + ")", document, null, XPathResult.NUMBER_TYPE, null).numberValue;
                  if (count === 1) return xpath;
              } catch(e) {}
           }
        }
        sibling = sibling.previousElementSibling;
     }

     // Strategy 2: Parent/Ancestor text (e.g. Card -> Button)
     var parent = el.parentElement;
     while(parent && parent !== document.body) {
        var parentText = (parent.innerText || '').split('\\n')[0].trim();
        if (parentText && parentText.length > 0 && parentText.length < 50) {
            var xpath = "//" + parent.tagName.toLowerCase() + "[contains(., '" + parentText.replace(/'/g, "\\'") + "')]//" + tagName;
             try {
                  var count = document.evaluate("count(" + xpath + ")", document, null, XPathResult.NUMBER_TYPE, null).numberValue;
                  if (count === 1) return xpath;
              } catch(e) {}
        }
        parent = parent.parentElement;
     }
     
     return null;
  }

    /* ---------------------------------------------------------------- */
    /*  Inspector: Locator Generation Logic                              */
    /* ---------------------------------------------------------------- */
    function getCandidates(el) {
        if (!el) return [];
        var candidates = [];
        var tagName = (el.tagName || '').toLowerCase();
        var text = (el.innerText || el.textContent || '').trim();
        var attrs = getAttributes(el);
        
        // --- 1. Playwright Built-in Locators (Highest Priority) ---
        
        // getByTestId
        var testId = attrs['data-testid'] || attrs['data-test-id'];
        if (testId) {
            candidates.push({
                strategy: 'getByTestId',
                value: "page.getByTestId('" + escapeSingle(testId) + "')",
                confidence: 1.0
            });
        }

        // getByRole
        var role = attrs['role'] || inferRoleFromTag(tagName);
        var name = (text || attrs['aria-label'] || attrs['name'] || '').trim();
        if (role) {
            // Check if role + name is unique enough
            // For now we just suggest it if name exists or for simple roles
            if (name && name.length < 50) {
                 candidates.push({
                    strategy: 'getByRole',
                    value: "page.getByRole('" + escapeSingle(role) + "', { name: '" + escapeSingle(name) + "' })",
                    confidence: 0.95
                });
            } else if (['button', 'checkbox', 'radio', 'textbox', 'combobox'].includes(role)) {
                 // Without name, role might be too generic, but still useful
                 candidates.push({
                    strategy: 'getByRole',
                    value: "page.getByRole('" + escapeSingle(role) + "')",
                    confidence: 0.6
                });
            }
        }

        // getByLabel
        if (el.id) {
            var label = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
            if (label) {
                var labelText = (label.innerText || '').trim();
                if (labelText) {
                    candidates.push({
                        strategy: 'getByLabel',
                        value: "page.getByLabel('" + escapeSingle(labelText) + "')",
                        confidence: 0.95
                    });
                }
            }
        }
        // Implicit label (input inside label)
        if (el.parentElement && el.parentElement.tagName === 'LABEL') {
            var labelText = (el.parentElement.innerText || '').replace(text, '').trim();
             if (labelText) {
                candidates.push({
                    strategy: 'getByLabel',
                    value: "page.getByLabel('" + escapeSingle(labelText) + "')",
                    confidence: 0.90
                });
            }
        }

        // getByPlaceholder
        if (attrs['placeholder']) {
            candidates.push({
                strategy: 'getByPlaceholder',
                value: "page.getByPlaceholder('" + escapeSingle(attrs['placeholder']) + "')",
                confidence: 0.90
            });
        }

        // getByAltText
        if (attrs['alt']) {
             candidates.push({
                strategy: 'getByAltText',
                value: "page.getByAltText('" + escapeSingle(attrs['alt']) + "')",
                confidence: 0.90
            });
        }

        // getByTitle
        if (attrs['title']) {
             candidates.push({
                strategy: 'getByTitle',
                value: "page.getByTitle('" + escapeSingle(attrs['title']) + "')",
                confidence: 0.90
            });
        }

        // getByText
        if (text && text.length < 50 && ['div','span','p','h1','h2','h3','h4','h5','h6','a','button','label'].includes(tagName)) {
             candidates.push({
                strategy: 'getByText',
                value: "page.getByText('" + escapeSingle(text) + "')",
                confidence: 0.85
            });
        }

        // --- 2. CSS Selectors (Medium Priority) ---

        // ID
        if (el.id && !/^(ember|react|\\d|:r|_) | (\d{2,})/.test(el.id)) {
            candidates.push({
                strategy: 'css-id',
                value: "#" + CSS.escape(el.id),
                confidence: 0.8
            });
        }

        // Class combination (if not too long/generic)
        if (el.className && typeof el.className === 'string') {
            var classes = el.className.split(/\s+/).filter(c => !c.startsWith('ng-') && !c.startsWith('css-') && c.length > 2);
            if (classes.length > 0) {
                 var classSelector = tagName + '.' + classes.join('.');
                 candidates.push({
                    strategy: 'css-class',
                    value: classSelector,
                    confidence: 0.5
                });
            }
        }

        // Attribute selectors
        ['name', 'type', 'href', 'src', 'action'].forEach(attr => {
            if (attrs[attr]) {
                candidates.push({
                    strategy: 'css-attr',
                    value: tagName + "[" + attr + "='" + CSS.escape(attrs[attr]) + "']",
                    confidence: 0.7
                });
            }
        });

        // Hierarchy / Full Path
        var fullPath = buildCssPath(el);
        if (fullPath) {
             candidates.push({
                strategy: 'css-path',
                value: fullPath,
                confidence: 0.4
            });
        }

        // --- 3. XPath (Fallback/Specific) ---

        // Relative XPath (Attribute based)
        var relXpath = buildRelativeXPath(el);
        if (relXpath) {
            candidates.push({
                strategy: 'xpath-relative',
                value: relXpath,
                confidence: 0.6
            });
        }
        
        // Text-based XPath
        if (text && text.length < 50) {
             candidates.push({
                strategy: 'xpath-text',
                value: "//" + tagName + "[text()='" + escapeSingle(text) + "']",
                confidence: 0.6
            });
            candidates.push({
                strategy: 'xpath-contains',
                value: "//" + tagName + "[contains(text(), '" + escapeSingle(text) + "')]",
                confidence: 0.55
            });
        }

        // Complex XPath (Axes)
        var complexXpath = buildComplexRelativeXPath(el);
        if (complexXpath) {
            candidates.push({
                strategy: 'xpath-axes',
                value: complexXpath,
                confidence: 0.75
            });
        }

        // Full XPath
        var fullXpath = buildXPath(el);
        if (fullXpath) {
            candidates.push({
                strategy: 'xpath-full',
                value: fullXpath,
                confidence: 0.3
            });
        }

        // Deduplicate
        var seen = new Set();
        return candidates.filter(function(c) {
            if (seen.has(c.value)) return false;
            seen.add(c.value);
            return true;
        }).sort((a, b) => b.confidence - a.confidence);
    }

    function buildInspectorPayload(el) {
        var attrs = getAttributes(el);
        var tag = el && el.tagName ? el.tagName.toLowerCase() : '';
        var text = (el.innerText || el.textContent || '').trim();
        
        var candidates = getCandidates(el);
        
        var rect = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
        var computedStyle = el && window.getComputedStyle ? window.getComputedStyle(el) : null;
        
        var styleProps = {};
        if (computedStyle) {
            styleProps['display'] = computedStyle.display;
            styleProps['visibility'] = computedStyle.visibility;
            styleProps['color'] = computedStyle.color;
            styleProps['background-color'] = computedStyle.backgroundColor;
            styleProps['font-size'] = computedStyle.fontSize;
        }
    
        var isVisible = false;
        if (rect && computedStyle) {
            isVisible = rect.width > 0 && rect.height > 0 && computedStyle.visibility !== 'hidden' && computedStyle.display !== 'none';
        }
    
        return {
          tagName: tag,
          innerText: text.slice(0, 120),
          attributes: attrs,
          candidates: candidates,
          rect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : undefined,
          computedStyle: styleProps,
          isVisible: isVisible
        };
    }

  document.addEventListener('mousemove', function(e) {
    if (!window.__playwrightInspectorActive) return;
    var el = e.target;
    if (el === inspectorLastTarget) return;
    inspectorLastTarget = el;
    highlightElement(el);
  }, true);

  document.addEventListener('contextmenu', function(e) {
    if (!window.__playwrightInspectorActive) return;
    e.preventDefault();
    e.stopPropagation();
    var el = e.target;
    highlightElement(el);
    if (window.__inspector && window.__inspector.sendEvent) {
      try {
        window.__inspector.sendEvent(buildInspectorPayload(el));
      } catch (err) {
        console.error('[Playwright IDE] Inspector sendEvent failed', err);
      }
    }
  }, true);

  /* ---------------------------------------------------------------- */
  /*  Validator: Highlight and count matches                           */
  /* ---------------------------------------------------------------- */
  
  var validatorOverlay = null;

  window.__playwrightValidateLocator = function(locator) {
    if (!locator) return { count: 0, error: 'Empty locator' };
    
    // Clear previous validation highlights
    if (validatorOverlay) {
      document.body.removeChild(validatorOverlay);
      validatorOverlay = null;
    }

    var elements = [];
    var strategy = 'css';

    try {
      if (locator.startsWith('//') || locator.startsWith('xpath=') || locator.startsWith('(')) {
        strategy = 'xpath';
        var xpath = locator.startsWith('xpath=') ? locator.slice(6) : locator;
        var result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0; i < result.snapshotLength; i++) {
          elements.push(result.snapshotItem(i));
        }
      } else {
        // Assume CSS
        strategy = 'css';
        // Handle "css=" prefix if present
        var css = locator.startsWith('css=') ? locator.slice(4) : locator;
        elements = Array.from(document.querySelectorAll(css));
      }
    } catch (e) {
      return { count: 0, error: e.message };
    }

    // Highlight elements
    if (elements.length > 0) {
      validatorOverlay = document.createElement('div');
      validatorOverlay.style.position = 'fixed';
      validatorOverlay.style.top = '0';
      validatorOverlay.style.left = '0';
      validatorOverlay.style.width = '100%';
      validatorOverlay.style.height = '100%';
      validatorOverlay.style.pointerEvents = 'none';
      validatorOverlay.style.zIndex = '2147483646'; // Below inspector overlay

      elements.forEach(function(el) {
        if (el.nodeType === 1) { // Element node
          var rect = el.getBoundingClientRect();
          var highlight = document.createElement('div');
          highlight.style.position = 'absolute';
          highlight.style.left = rect.left + 'px';
          highlight.style.top = rect.top + 'px';
          highlight.style.width = rect.width + 'px';
          highlight.style.height = rect.height + 'px';
          highlight.style.border = '2px solid #ef4444'; // Red-500
          highlight.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          highlight.style.boxSizing = 'border-box';
          validatorOverlay.appendChild(highlight);
        }
      });
      document.body.appendChild(validatorOverlay);
      
      // Auto-remove after 3 seconds
      setTimeout(function() {
        if (validatorOverlay && validatorOverlay.parentNode) {
          validatorOverlay.parentNode.removeChild(validatorOverlay);
          validatorOverlay = null;
        }
      }, 3000);
    }

    return { count: elements.length };
  };

  console.log('[Playwright IDE] Recorder + Inspector script injected successfully');
})();
`;
}
//# sourceMappingURL=inject-script.js.map