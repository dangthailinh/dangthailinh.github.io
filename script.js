<!DOCTYPE html>
<html lang="en">
<head>
    <script src="script.js"></script>
    <link rel="stylesheet" href="styles.css">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAI-09-hitoshi</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    <style>
        /* CSS styles remain the same */
    </style>
</head>
<body>
<audio id="backgroundMusic" autoplay loop>
    <source src="https://soundcloud.com/melodic-reflection/spirited-away?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing" type="audio/mp3">
    Your browser does not support the audio element.
</audio>

<header>
    <!-- Header content remains the same -->
</header>

<nav>
    <!-- Nav content remains the same -->
</nav>

<section id="home">
    <!-- Home section content remains the same -->
</section>

<section id="about">
    <!-- About section content remains the same -->
</section>

<section id="anime">
    <h2>Anime Blog</h2>
    <div class="content">
        <div class="card-deck">
            <!-- JavaScript will dynamically create and append cards here -->
        </div>
    </div>
</section>

<section id="contact">
    <!-- Contact section content remains the same -->
</section>

<footer>
    <!-- Footer content remains the same -->
</footer>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        const animeData = [
            {
                title: "MyAnimeContent in Facebook",
                description: "Check out my posts in the AOT group on Facebook.",
                link: "https://www.facebook.com/groups/2726030640802392/user/100053877579950",
                image: "https://th.bing.com/th/id/OIP.OTXopnMQOgbKfo-urJNhKgHaFN?rs=1&pid=ImgDetMain"
            },
            {
                title: "Crunchyroll",
                description: "Stream anime online with Crunchyroll.",
                link: "https://www.crunchyroll.com/",
                image: "https://th.bing.com/th/id/R.7ddf7be12614094c59bb63d217148bb8?rik=grJ3z5gaFe2Igw&pid=ImgRaw&r=0"
            },
            {
                title: "Funimation",
                description: "Watch anime episodes and movies on Funimation.",
                link: "https://www.funimation.com/",
                image: "https://th.bing.com/th/id/R.e4015409b8c18e5d61bb8a4371677d43?rik=hTRyOmEvdZUIKg&pid=ImgRaw&r=0"
            }
        ];

        const cardDeck = document.querySelector('.card-deck');

        animeData.forEach(anime => {
            const card = document.createElement('div');
            card.classList.add('card');

            card.innerHTML = `
                <img src="${anime.image}" class="card-img-top" alt="Anime Image">
                <div class="card-body">
                    <h5 class="card-title">${anime.title}</h5>
                    <p class="card-text">${anime.description}</p>
                    <a href="${anime.link}" class="btn btn-primary">Watch Now</a>
                </div>
            `;

            cardDeck.appendChild(card);
        });
    });
</script>

</body>
</html>
