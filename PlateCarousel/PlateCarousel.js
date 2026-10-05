/**
 * 3D Plate Carousel Component (A24-Style Edge-to-Edge Linear Scroll)
 * Reusable & Standalone Module
 * 
 * Features:
 * - 3D tilted ceramic plates with realistic depth & dynamic parallax rotation
 * - Edge-to-edge linear track movement
 * - Intelligent wheel & touch scroll trapping (optional)
 * - Custom item data support & callback hooks
 */
class PlateCarousel {
    constructor(container, options = {}) {
        // Mount container
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) {
            console.error('PlateCarousel: Invalid container target provided');
            return;
        }

        // Configuration Options
        this.options = Object.assign({
            items: [
                { name: "ProGrain Roti", sub: "3 Rotis + Bowl Dal", protein: "~40g", tag: "ProGrain Recipe", img: "components/PlateCarousel/assets/Roti.png" },
                { name: "Poori with Chole", sub: "3 Poori + Bowl Chole", protein: "~35g", tag: "ProGrain Recipe", img: "components/PlateCarousel/assets/Poori.png" },
                { name: "Thepla with Chutney", sub: "3 Thepla + Green Chutney", protein: "~29g", tag: "ProGrain Recipe", img: "components/PlateCarousel/assets/Thepla.png" },
                { name: "Stuffed Parantha", sub: "2 Parantha + Curd", protein: "~25g", tag: "ProGrain Recipe", img: "components/PlateCarousel/assets/Parantha.png" },
                { name: "Upma", sub: "Bowl of Upma + Chutney", protein: "~20g", tag: "ProGrain Recipe", img: "components/PlateCarousel/assets/Upma.png" },
                { name: "Cookies", sub: "4 High Protein Cookies", protein: "~13g", tag: "ProGrain Recipe", img: "components/PlateCarousel/assets/Cookies.png" }
            ],
            trapScroll: true,
            stickyNavbarOffset: 76,
            onSlideChange: null
        }, options);

        this.items = this.options.items;
        this.currentIndex = 0;
        
        // Physics & Animation State
        this.targetX = 0;
        this.currentX = 0;
        this.itemWidth = 0;
        this.gap = -40;
        this.trackWidth = 0;
        this.rafId = null;

        // Bound Event Handlers (for clean removal on destroy)
        this._onResize = this.updateDimensions.bind(this);
        this._onWheel = this._handleWheel.bind(this);
        this._onTouchStart = this._handleTouchStart.bind(this);
        this._onTouchMove = this._handleTouchMove.bind(this);
        this._onKeyDown = this._handleKeyDown.bind(this);

        this.init();
    }

    init() {
        this.render();
        
        this.track = this.container.querySelector('.lpc-track');
        this.plateElements = Array.from(this.container.querySelectorAll('.lpc-plate-wrapper'));
        this.slides = Array.from(this.container.querySelectorAll('.lpc-info-slide'));
        this.dots = Array.from(this.container.querySelectorAll('.lpc-dot'));

        this.updateDimensions();

        window.addEventListener('resize', this._onResize);

        if (this.options.trapScroll) {
            this.bindScrollEvents();
        }

        this.bindControls();
        this.tick();
        this.updateInfoPanel(0);
    }

    updateDimensions() {
        if (!this.plateElements.length) return;

        const rect = this.plateElements[0].getBoundingClientRect();
        this.itemWidth = rect.width || 360;
        this.gap = window.innerWidth < 768 ? -20 : -40;

        const totalItemWidth = this.itemWidth + this.gap;

        this.plateElements.forEach((el, index) => {
            const xOffset = index * totalItemWidth;
            el.style.transform = `translateX(${xOffset}px) rotateX(15deg) rotateY(-10deg) rotateZ(5deg)`;
            el.style.zIndex = this.items.length - index;
        });

        this.trackWidth = (this.items.length - 1) * totalItemWidth;
        this.targetX = this.currentIndex * totalItemWidth;
    }

    bindScrollEvents() {
        this._lastWheelTime = 0;
        this._isSnapping = false;

        window.addEventListener('wheel', this._onWheel, { passive: false });
        window.addEventListener('touchstart', this._onTouchStart, { passive: true });
        window.addEventListener('touchmove', this._onTouchMove, { passive: false });
    }

    _handleWheel(e) {
        const rect = this.container.getBoundingClientRect();
        const navOffset = this.options.stickyNavbarOffset;
        const isSectionInView = rect.top <= navOffset + 80 && rect.bottom >= (window.innerHeight - navOffset - 80);
        
        if (!isSectionInView) return;

        const now = Date.now();
        const delta = e.deltaY;

        if (delta > 8) { // Scroll Down -> Next Item
            if (this.currentIndex < this.items.length - 1) {
                e.preventDefault();
                e.stopPropagation();
                if (now - this._lastWheelTime > 250) {
                    this._lastWheelTime = now;
                    this._snapToNavbar();
                    this.goTo(this.currentIndex + 1);
                }
            }
        } else if (delta < -8) { // Scroll Up -> Prev Item
            if (this.currentIndex > 0) {
                e.preventDefault();
                e.stopPropagation();
                if (now - this._lastWheelTime > 250) {
                    this._lastWheelTime = now;
                    this._snapToNavbar();
                    this.goTo(this.currentIndex - 1);
                }
            }
        }
    }

    _handleTouchStart(e) {
        if (e.touches.length > 0) {
            this._touchStartY = e.touches[0].clientY;
        }
    }

    _handleTouchMove(e) {
        const rect = this.container.getBoundingClientRect();
        const navOffset = this.options.stickyNavbarOffset;
        const isSectionInView = rect.top <= navOffset + 80 && rect.bottom >= (window.innerHeight - navOffset - 80);
        if (!isSectionInView || !e.touches.length) return;

        const diffY = this._touchStartY - e.touches[0].clientY;
        const now = Date.now();
        if (now - this._lastWheelTime < 300) return;

        if (Math.abs(diffY) > 20) {
            if (diffY > 0 && this.currentIndex < this.items.length - 1) {
                if (e.cancelable) e.preventDefault();
                this._lastWheelTime = now;
                this._snapToNavbar();
                this.goTo(this.currentIndex + 1);
            } else if (diffY < 0 && this.currentIndex > 0) {
                if (e.cancelable) e.preventDefault();
                this._lastWheelTime = now;
                this._snapToNavbar();
                this.goTo(this.currentIndex - 1);
            }
        }
    }

    _snapToNavbar() {
        if (this._isSnapping) return;
        const rect = this.container.getBoundingClientRect();
        const navOffset = this.options.stickyNavbarOffset;
        if (Math.abs(rect.top - navOffset) > 4 && Math.abs(rect.top - navOffset) < 180) {
            this._isSnapping = true;
            const targetY = window.scrollY + rect.top - navOffset;
            window.scrollTo({ top: targetY, behavior: 'smooth' });
            setTimeout(() => { this._isSnapping = false; }, 300);
        }
    }

    bindControls() {
        const prevBtn = this.container.querySelector('.pc-prev');
        const nextBtn = this.container.querySelector('.pc-next');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
        if (nextBtn) nextBtn.addEventListener('click', () => this.next());

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goTo(index));
        });

        this.container.setAttribute('tabindex', '0');
        this.container.addEventListener('keydown', this._onKeyDown);
    }

    _handleKeyDown(e) {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
    }

    goTo(index) {
        if (index < 0 || index >= this.items.length) return;
        this.currentIndex = index;
        const totalItemWidth = this.itemWidth + this.gap;
        this.targetX = index * totalItemWidth;
        this.updateInfoPanel(index);

        if (typeof this.options.onSlideChange === 'function') {
            this.options.onSlideChange(index, this.items[index]);
        }
    }

    next() {
        this.goTo(this.currentIndex + 1);
    }

    prev() {
        this.goTo(this.currentIndex - 1);
    }

    updateInfoPanel(index) {
        this.slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        this.dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    tick() {
        const ease = 0.1;
        this.currentX += (this.targetX - this.currentX) * ease;

        if (this.track) {
            const centerOffset = (window.innerWidth / 2) - (this.itemWidth / 2);
            this.track.style.transform = `translateX(${centerOffset - this.currentX}px)`;

            const totalItemWidth = this.itemWidth + this.gap;
            this.plateElements.forEach((el, index) => {
                const itemX = index * totalItemWidth;
                const distanceToCenter = itemX - this.currentX;
                const normalizedDist = distanceToCenter / window.innerWidth;

                const dynamicRotateY = -10 + (normalizedDist * 15);
                const dynamicRotateZ = 5 + (normalizedDist * -10);

                el.style.transform = `translateX(${itemX}px) rotateX(15deg) rotateY(${dynamicRotateY}deg) rotateZ(${dynamicRotateZ}deg)`;
            });
        }

        this.rafId = requestAnimationFrame(this.tick.bind(this));
    }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        window.removeEventListener('resize', this._onResize);
        window.removeEventListener('wheel', this._onWheel);
        window.removeEventListener('touchstart', this._onTouchStart);
        window.removeEventListener('touchmove', this._onTouchMove);
    }

    render() {
        this.container.innerHTML = `
            <div class="lpc-mount">
                <div class="lpc-info-panel">
                    ${this.items.map((item, index) => `
                        <div class="lpc-info-slide ${index === 0 ? 'active' : ''}">
                            <div class="lpc-info-text-group">
                                <span class="lpc-info-tag">${item.tag || 'Featured Item'}</span>
                                <h3 class="lpc-info-title">${item.name}</h3>
                                <p class="lpc-info-portion">${item.sub || ''}</p>
                            </div>
                            ${item.protein ? `
                                <div class="lpc-protein-callout">
                                    <span class="lpc-protein-num">${item.protein}</span>
                                    <span class="lpc-protein-label">Protein Per<br>Serving</span>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>

                <div class="lpc-scene">
                    <div class="lpc-track">
                        ${this.items.map((item) => `
                            <div class="lpc-plate-wrapper">
                                <div class="lpc-plate">
                                    <img src="${item.img}" alt="${item.name}" class="lpc-food-img" draggable="false">
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="lpc-controls">
                    <button class="lpc-nav-btn pc-prev" aria-label="Previous">‹</button>
                    <div class="lpc-dots">
                        ${this.items.map((_, i) => `<button class="lpc-dot ${i === 0 ? 'active' : ''}" aria-label="Go to slide ${i + 1}"></button>`).join('')}
                    </div>
                    <button class="lpc-nav-btn pc-next" aria-label="Next">›</button>
                </div>
            </div>
        `;
    }
}

// Export for ES modules & browser global window
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlateCarousel;
} else {
    window.PlateCarousel = PlateCarousel;
}
