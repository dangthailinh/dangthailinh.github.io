// Dữ liệu bài viết chung (có thể mở rộng)
const posts = {
    all: [
        { id: 1, title: 'Xây dựng hạ tầng phục vụ hàng triệu người dùng trên AWS - Bài 0 - Chuẩn bị', meta: 'Oct 28, 2023 | Quan Huyền', content: 'Nội dung chi tiết: Giới thiệu về chuẩn bị AWS, thiết lập tài khoản, best practices cho scale lớn. Đây là phần mở đầu series về hạ tầng AWS.', category: 'AWS' },
        { id: 2, title: 'Tiếp theo: Bài 1 - Thiết kế cơ bản', meta: 'Nov 01, 2023 | Admin', content: 'Nội dung: Chi tiết thiết kế VPC, EC2, Load Balancer trên AWS.', category: 'AWS' },
        { id: 3, title: 'Hướng dẫn Terraform trên AWS', meta: 'Nov 05, 2023 | Guest', content: 'Nội dung: Sử dụng Terraform để deploy infrastructure as code.', category: 'DevOps' },
        { id: 4, title: 'Azure vs AWS: So sánh chi phí', meta: 'Nov 10, 2023 | Expert', content: 'Nội dung: Phân tích chi phí cho ứng dụng web lớn.', category: 'Azure' },
        { id: 5, title: 'Kubernetes Deployment Best Practices', meta: 'Nov 15, 2023 | DevOps Team', content: 'Nội dung: Hướng dẫn deploy K8s trên cloud.', category: 'Kubernetes' },
        { id: 6, title: 'Networking in Cloud: VPC và Subnets', meta: 'Nov 20, 2023 | Network Guru', content: 'Nội dung: Thiết kế mạng ảo an toàn.', category: 'Networking' },
        { id: 7, title: 'Học English cho DevOps: Common Terms', meta: 'Nov 25, 2023 | English Coach', content: 'Nội dung: Từ vựng tiếng Anh cơ bản về DevOps.', category: 'English' }
    ],
    aws: [
        { id: 1, title: 'Xây dựng hạ tầng phục vụ hàng triệu người dùng trên AWS - Bài 0 - Chuẩn bị', meta: 'Oct 28, 2023 | Quan Huyền', content: 'Nội dung chi tiết AWS...' },
        { id: 2, title: 'Tiếp theo: Bài 1 - Thiết kế cơ bản', meta: 'Nov 01, 2023 | Admin', content: 'Nội dung AWS...' },
        { id: 8, title: 'AWS Lambda Best Practices', meta: 'Dec 01, 2023 | AWS Expert', content: 'Nội dung: Serverless trên AWS.' }
    ],
    azure: [
        { id: 4, title: 'Azure vs AWS: So sánh chi phí', meta: 'Nov 10, 2023 | Expert', content: 'Nội dung Azure...' },
        { id: 9, title: 'Azure Kubernetes Service (AKS)', meta: 'Dec 05, 2023 | Azure Pro', content: 'Nội dung: Deploy K8s trên Azure.' }
    ],
    devops: [
        { id: 3, title: 'Hướng dẫn Terraform trên AWS', meta: 'Nov 05, 2023 | Guest', content: 'Nội dung DevOps...' },
        { id: 10, title: 'CI/CD Pipeline with Jenkins', meta: 'Dec 10, 2023 | DevOps Lead', content: 'Nội dung: Xây dựng pipeline.' }
    ],
    k8s: [
        { id: 5, title: 'Kubernetes Deployment Best Practices', meta: 'Nov 15, 2023 | DevOps Team', content: 'Nội dung K8s...' },
        { id: 11, title: 'Helm Charts for Beginners', meta: 'Dec 15, 2023 | K8s Guru', content: 'Nội dung: Sử dụng Helm.' }
    ],
    networking: [
        { id: 6, title: 'Networking in Cloud: VPC và Subnets', meta: 'Nov 20, 2023 | Network Guru', content: 'Nội dung Networking...' },
        { id: 12, title: 'Load Balancing Techniques', meta: 'Dec 20, 2023 | Net Expert', content: 'Nội dung: Cân bằng tải.' }
    ],
    english: [
        { id: 7, title: 'Học English cho DevOps: Common Terms', meta: 'Nov 25, 2023 | English Coach', content: 'Nội dung English...' },
        { id: 13, title: 'Technical Writing in English', meta: 'Dec 25, 2023 | Writer', content: 'Nội dung: Viết tài liệu kỹ thuật.' }
    ]
};

let currentPage = 1;
const postsPerPage = 3;

// Render bài viết theo category và trang
function renderPosts(category, page) {
    const categoryPosts = posts[category] || posts.all;
    const start = (page - 1) * postsPerPage;
    const end = start + postsPerPage;
    const pagePosts = categoryPosts.slice(start, end);
    const postList = document.getElementById('postList');
    postList.innerHTML = '';
    pagePosts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `
            <h2>${post.title}</h2>
            <div class="post-meta">${post.meta}</div>
            <p>${post.content.substring(0, 100)}...</p>
        `;
        postDiv.onclick = () => openPost(post.title, post.content);
        postList.appendChild(postDiv);
    });
    updatePagination(page);
}

function updatePagination(page) {
    const buttons = document.querySelectorAll('.pagination button');
    buttons.forEach((btn, index) => {
        btn.classList.toggle('active', index + 1 === page);
    });
}

function changePage(page, category) {
    currentPage = page;
    renderPosts(category, page);
}

// Modal functions
function openPost(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').textContent = content;
    document.getElementById('postModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('postModal').style.display = 'none';
}

// Search function (tìm trong category hiện tại)
function initSearch(category) {
    document.getElementById('searchInput').addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        const categoryPosts = posts[category] || posts.all;
        const filteredPosts = categoryPosts.filter(post => post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query));
        const postList = document.getElementById('postList');
        postList.innerHTML = '';
        filteredPosts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.className = 'post';
            postDiv.innerHTML = `
                <h2>${post.title}</h2>
                <div class="post-meta">${post.meta}</div>
                <p>${post.content.substring(0, 100)}...</p>
            `;
            postDiv.onclick = () => openPost(post.title, post.content);
            postList.appendChild(postDiv);
        });
    });
}

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    document.querySelector('.theme-toggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', newTheme);
}

// Load theme
window.onload = function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.querySelector('.theme-toggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    const currentPageType = window.location.pathname.split('/').pop().split('.')[0] || 'index';
    const category = currentPageType === 'index' ? 'all' : currentPageType;
    renderPosts(category, 1);
    initSearch(category);
};

// Xử lý click card (mở modal)
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            const content = this.dataset.content || 'Nội dung chi tiết bài viết...'; // Lấy từ data-content
            openPost(title, content);
        });
    });
});
// Cập nhật posts cho am-nhac với audio demo
posts.am_nhac = [
    { id: 5, title: 'Top album Taylor Swift năm 2025', meta: 'Oct 30, 2025 | Music Guru', content: 'Nội dung chi tiết: Folklore 2.0...', audio: null }, // Không có audio demo
    { id: 11, title: 'Lịch sử Rock: Từ Beatles đến Metallica', meta: 'Dec 01, 2025 | Rock Legend', content: 'Nội dung: Sự phát triển thể loại...', audio: 'data:audio/mp3;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...' } // Demo base64 (thay bằng thật)
];

// Upload form handler (cập nhật cho audio)
function initUploadForm(category) {
    const form = document.getElementById('uploadForm');
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            const title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;
            const audioFile = document.getElementById('audioFile').files[0];
            let audioData = null;
            if (audioFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    audioData = e.target.result; // Base64
                    saveAndRender(title, content, audioData, category);
                };
                reader.readAsDataURL(audioFile);
            } else {
                saveAndRender(title, content, null, category);
            }
        };
    }
}

function saveAndRender(title, content, audioData, category) {
    const newPost = {
        id: Date.now(),
        title,
        meta: `Just now | User Upload`,
        content,
        audio: audioData // Base64 URL
    };
    savePostToStorage(category, newPost);
    renderAudioPosts(category, 1); // Render grid với audio
    document.getElementById('uploadForm').reset();
    alert('Bài viết/nhạc đã được upload! Click play để nghe.');
}

// Render grid với audio (cho am-nhac)
function renderAudioPosts(category, page) {
    loadPostsFromStorage(category);
    const categoryPosts = posts[category] || posts.all;
    const start = (page - 1) * postsPerPage;
    const end = start + postsPerPage;
    const pagePosts = categoryPosts.slice(start, end);
    const postList = document.getElementById('postList') || document.querySelector('.card-grid'); // Adapt cho grid
    if (!postList) return;
    postList.innerHTML = '';
    pagePosts.forEach(post => {
        const card = document.createElement('div');
        card.className = `card ${post.audio ? 'audio-card' : ''}`;
        card.innerHTML = `
            <div class="card-icon">🎵</div>
            <div class="card-diagram">Giai Điệu → Thu Âm → Phát</div>
            <h3>${post.title}</h3>
            <div class="card-meta">${post.meta}</div>
            ${post.audio ? `
                <audio controls preload="metadata">
                    <source src="${post.audio}" type="audio/mpeg">
                    Trình duyệt không hỗ trợ audio.
                </audio>
            ` : '<p>Không có audio kèm theo.</p>'}
        `;
        card.onclick = (e) => {
            if (!e.target.closest('audio')) { // Không trigger nếu click audio
                openPost(post.title, post.content);
            }
        };
        postList.appendChild(card);
    });
    updatePagination(page);
}

// Trong window.onload, nếu category === 'am-nhac', dùng renderAudioPosts
window.onload = function() {
    // ... code cũ ...
    const currentPageType = window.location.pathname.split('/').pop().split('.')[0] || 'index';
    const category = currentPageType === 'index' ? 'all' : currentPageType.replace('-', '');
    if (category === 'amnhac') { // Adapt tên 'am-nhac' → 'amnhac'
        renderAudioPosts(category, 1);
    } else {
        renderPosts(category, 1);
    }
    initSearch(category);
    initUploadForm(category);
};
// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('postModal');
    if (event.target === modal) {
        closeModal();
    }
};



// Lấy các phần tử
const items = document.querySelectorAll('.item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxVideo = document.getElementById('lightbox-video');
const closeBtn = document.querySelector('.close');

// Khi click vào ảnh hoặc video
items.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const video = item.querySelector('video');

        if (img) {
            lightboxImg.src = img.src;
            lightboxImg.style.display = 'block';
            lightboxVideo.style.display = 'none';
        } else if (video) {
            lightboxVideo.src = video.src;
            lightboxVideo.style.display = 'block';
            lightboxImg.style.display = 'none';
        }

        lightbox.style.display = 'flex';
    });
});



// Đóng lightbox
closeBtn.addEventListener('click', () => {
    lightbox.style.display = 'none';
    lightboxImg.src = '';
    lightboxVideo.src = '';
});



