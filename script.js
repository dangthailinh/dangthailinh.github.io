<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="styles.css">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAI-09-hitoshi</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    <style>
        body {
            background-image: url("https://wallpapercave.com/wp/wp4785708.gif");
            background-size: cover;
            background-position: center;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        header {
            background-image: url('https://th.bing.com/th/id/R.b19b938d498e6a6b76f12cf7116820e6?rik=lbbEhdVU557s6g&pid=ImgRaw&r=0'); /* Example header image URL */
            background-size: cover;
            background-position: center;
            color: #fff;
            padding: 100px 0;
            text-align: center;
        }
        nav {
            background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 100%), url("https://ct101.commons.gc.cuny.edu/wp-content/blogs.dir/13027/files/2020/11/cyberpunk-gif.gif");
            background-size: cover;
            background-position: center;
            color: #fff;
            text-align: center;
            padding: 20px 0;
            border-bottom-left-radius: 50% 20px;
            border-bottom-right-radius: 50% 20px;
            position: fixed;
            top: 0;
            left: -250px; /* Initially hide the navigation */
            width: 250px;
            height: 100%;
            transition: left 0.3s ease;
        }
        nav.show {
            left: 0; /* Show the navigation when the 'show' class is added */
        }
        nav a {
            background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0) 100%), url('');
            background-size: cover;
            background-position: center;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 20px;
            margin: 0 10px;
            display: block;
        }
        nav a:hover {
            background-color: #555555;
        }
        .content {
            max-width: 800px;
            margin: 0 auto;
            padding-left: 260px; /* Adjust content area to accommodate the navigation */
        }
        .toggle-nav {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 9999;
        }
    </style>
</head>
<body>
<header>
    <h1>(っ◔◡◔)っ ♥ Welcome to MAI-09-hitoshi ♥</h1>
    <p>私はかなり紛らわしいチャンネル@@maiタンタイリンです:)!</p>
    <p>Ｒｅｌａｘｉｎｇ░ｗｉｔｈ░ｓｏｍｅ░ｍｕｓｉｃ：　（ギヂ気き）</p>
    <div class="audio-container">
        <audio id="audio-player" controls loop>
            <source src="whistle_maybe_final.mp3" type="audio/mp3">
        </audio>
    </div>
</header>

<div class="toggle-nav">
    <button onclick="toggleNav()">☰ Show Slide Navigation</button>
</div>

<nav id="slide-nav">
    <a href="#">Art</a>
    <a href="#">Book</a>
    <a href="#">Cartoon</a>
</nav>

<div class="content">
    <h2>Main Content Area</h2>
    <p>This is the main content area. You can put your main website content here.</p>
</div>

<script>
    function toggleNav() {
        var nav = document.getElementById('slide-nav');
        nav.classList.toggle('show');
    }
    // Function to change cursor icon
    function changeCursor() {
        document.body.style.cursor = "url('https://image.pngaaa.com/417/1278417-middle.png'), auto";
    }
</script>

</body>
</html>
