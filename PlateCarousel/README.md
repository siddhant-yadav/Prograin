# 3D Plate Carousel (A24 CD-Style Edge-to-Edge Linear Scroll)

A standalone, modular JavaScript component that creates an interactive 3D ceramic food plate / CD carousel. Plates scroll edge-to-edge across the screen with real-time 3D parallax tilt, smooth lerp physics, and wheel/touch scroll trapping.

---

## 📁 Directory Structure

```text
PlateCarousel/
├── PlateCarousel.js      # Core standalone Component Class
├── PlateCarousel.css      # Scoped 3D CSS styles & animations
├── README.md             # Developer Integration Guide
└── example.html          # Standalone quickstart demo
```

---

## 🚀 Quick Start Guide

### 1. Include CSS and JS Files

Add `PlateCarousel.css` in your HTML `<head>` and `PlateCarousel.js` before `</body>`:

```html
<!-- In <head> -->
<link rel="stylesheet" href="./PlateCarousel.css">

<!-- Before </body> -->
<script src="./PlateCarousel.js"></script>
```

---

### 2. Create Mount Element in HTML

```html
<section id="my-recipes-section" style="min-height: calc(100vh - 76px);">
  <div id="plateCarouselMount"></div>
</section>
```

---

### 3. Initialize Component in JavaScript

```html
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const carousel = new PlateCarousel('#plateCarouselMount', {
      stickyNavbarOffset: 76,
      trapScroll: true,
      items: [
        { name: "ProGrain Roti", sub: "3 Rotis + Bowl Dal", protein: "~40g", tag: "Recipe #1", img: "Assets/Roti.png" },
        { name: "Poori with Chole", sub: "3 Poori + Bowl Chole", protein: "~35g", tag: "Recipe #2", img: "Assets/Poori.png" },
        { name: "Thepla with Chutney", sub: "3 Thepla + Green Chutney", protein: "~29g", tag: "Recipe #3", img: "Assets/Thepla.png" },
        { name: "Stuffed Parantha", sub: "2 Parantha + Curd", protein: "~25g", tag: "Recipe #4", img: "Assets/Parantha.png" },
        { name: "Upma", sub: "Bowl of Upma + Chutney", protein: "~20g", tag: "Recipe #5", img: "Assets/Upma.png" },
        { name: "Cookies", sub: "4 High Protein Cookies", protein: "~13g", tag: "Recipe #6", img: "Assets/Cookies.png" }
      ],
      onSlideChange: (index, item) => {
        console.log(`Switched to slide ${index}: ${item.name}`);
      }
    });
  });
</script>
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `items` | `Array` | `[...]` | Array of item objects `({ name, sub, protein, tag, img })`. |
| `trapScroll` | `Boolean` | `true` | Intercepts wheel scroll to navigate horizontally when section is in view. |
| `stickyNavbarOffset` | `Number` | `76` | Top navbar height in pixels to snap section cleanly. |
| `onSlideChange` | `Function` | `null` | Callback function triggered when slide index changes `(index, item)`. |

---

## 🛠️ API Methods

The `PlateCarousel` instance exposes the following controls:

```javascript
const carousel = new PlateCarousel('#mount');

// Navigate to specific index
carousel.goTo(2);

// Go to next plate
carousel.next();

// Go to previous plate
carousel.prev();

// Destroy instance (removes window wheel/touch listeners and stops animation)
carousel.destroy();
```

---

## 🎨 Customizing Styles

Customize the color scheme using standard CSS variables:

```css
:root {
  --pc-accent: #C87A1E;      /* Primary accent color for tags, active dots, buttons */
  --pc-text-dark: #1A1008;   /* Header text color */
  --pc-text-muted: #6B5B45;  /* Portion and label subtitle color */
  --pc-bg: #F7F4EF;          /* Background color */
}
```
