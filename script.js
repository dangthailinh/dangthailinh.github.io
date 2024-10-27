 const slides = document.getElementById('slides');
    const dotsContainer = document.getElementById('nav-dots');
    const totalSlides = 5;
    let currentIndex = 0;

    function createDots() {
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('nav-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    function goToSlide(index) {
        currentIndex = index;
        slides.style.transform = `translateX(-${index * 100}%)`;
        updateDots();
    }

    function updateDots() {
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentIndex].classList.add('active');
    }

    function autoSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        goToSlide(currentIndex);
    }

    setInterval(autoSlide, 3000);
    createDots();
