window.KNOWLEDGE_ARTICLES = [
  { id: 'linux', category: 'devops', order: 1, path: 'devops/linux.html', title: 'Giới thiệu về Linux', description: 'Hệ điều hành Linux và những câu lệnh nền tảng cần biết.', tags: ['Linux', 'Căn bản'] },
  { id: 'docker', category: 'devops', order: 2, path: 'devops/docker.html', title: 'Tổng quan về Docker', description: 'Hiểu container, image và cách Docker vận hành ứng dụng.', tags: ['Docker', 'Container'] },
  { id: 'cloud', category: 'devops', order: 3, path: 'devops/cloud-computing.html', title: 'Cloud Computing', description: 'Điện toán đám mây và những ứng dụng trong thực tế.', tags: ['Cloud', 'Tổng quan'] },
  { id: 'network', category: 'devops', order: 4, path: 'devops/networking.html', title: 'Networking', description: 'Các khái niệm mạng máy tính căn bản cần làm rõ.', tags: ['Network', 'Nền tảng'] },
  { id: 'terraform', category: 'devops', order: 5, path: 'devops/terraform.html', title: 'Terraform', description: 'Làm quen Infrastructure as Code và các lệnh thường dùng.', tags: ['Terraform', 'IaC'] },
  { id: 'nginx', category: 'devops', order: 6, path: 'devops/nginx.html', title: 'Nginx', description: 'Cơ chế hoạt động của web server và reverse proxy Nginx.', tags: ['Nginx', 'Server'] },
  { id: 'ci-cd', category: 'devops', order: 7, path: 'devops/ci-cd.html', title: 'CI/CD Pipeline', description: 'Tự động hóa kiểm thử, đóng gói và triển khai phần mềm.', tags: ['CI/CD', 'Automation'] },

  { id: 'aws', category: 'aws', order: 1, path: 'aws/overview.html', title: 'Tổng quan về AWS', description: 'Bức tranh tổng thể về nền tảng và các dịch vụ phổ biến.', tags: ['AWS', 'Nhập môn'] },
  { id: 'ec2', category: 'aws', order: 2, path: 'aws/ec2.html', title: 'EC2 · Máy chủ ảo', description: 'Khởi tạo và quản lý máy chủ ảo đầu tiên trên AWS.', tags: ['EC2', 'Compute'] },
  { id: 'vpc', category: 'aws', order: 3, path: 'aws/vpc.html', title: 'VPC · Mạng riêng ảo', description: 'Thiết kế mạng nội bộ và kiểm soát luồng truy cập.', tags: ['VPC', 'Network'] },
  { id: 'iam', category: 'aws', order: 4, path: 'aws/iam.html', title: 'IAM · Quyền truy cập', description: 'Quản lý người dùng, nhóm và chính sách bảo mật.', tags: ['IAM', 'Security'] },
  { id: 'ecs', category: 'aws', order: 5, path: 'aws/ecs.html', title: 'ECS · Chạy Container', description: 'Triển khai và quản lý ứng dụng Docker bằng ECS.', tags: ['ECS', 'Container'] },
  { id: 'ecr', category: 'aws', order: 6, path: 'aws/ecr.html', title: 'ECR · Kho Docker Image', description: 'Lưu trữ và quản lý container image an toàn trên AWS.', tags: ['ECR', 'Registry'] },
  { id: 's3', category: 'aws', order: 7, path: 'aws/s3.html', title: 'S3 · Lưu trữ dữ liệu', description: 'Dịch vụ object storage linh hoạt, bền vững và bảo mật.', tags: ['S3', 'Storage'] },
  { id: 'rds', category: 'aws', order: 8, path: 'aws/rds.html', title: 'RDS · Cơ sở dữ liệu', description: 'Triển khai MySQL, PostgreSQL và MariaDB được quản lý.', tags: ['RDS', 'Database'] },
  { id: 'cloudfront', category: 'aws', order: 9, path: 'aws/cloudfront.html', title: 'CloudFront · CDN', description: 'Tăng tốc phân phối và bảo vệ nội dung trên toàn cầu.', tags: ['CloudFront', 'CDN'] },

  { id: 'ai', category: 'ai', order: 1, path: 'ai/overview.html', title: 'AI là gì?', description: 'Khái niệm, lịch sử và vai trò của trí tuệ nhân tạo.', tags: ['AI', 'Nhập môn'] },
  { id: 'machine-learning', category: 'ai', order: 2, path: 'ai/machine-learning.html', title: 'Machine Learning', description: 'Cách máy tính học từ dữ liệu cùng các thuật toán phổ biến.', tags: ['ML', 'Thuật toán'] },
  { id: 'deep-learning', category: 'ai', order: 3, path: 'ai/deep-learning.html', title: 'Deep Learning', description: 'Mạng nơ-ron sâu, CNN, RNN và những ứng dụng thực tế.', tags: ['Deep Learning', 'Neural Network'] },
  { id: 'ai-programming', category: 'ai', order: 4, path: 'ai/ai-in-programming.html', title: 'AI trong lập trình', description: 'Gợi ý mã, phân tích lỗi và tự động hóa quy trình phát triển.', tags: ['AI Tools', 'Coding'] },

  { id: 'computer-basics', category: 'programming', order: 1, path: 'programming/computer-basics.html', title: 'Máy tính hoạt động thế nào?', description: 'Phần cứng, phần mềm và cách các thành phần phối hợp.', tags: ['Computer', 'Nền tảng'] },
  { id: 'programming-languages', category: 'programming', order: 2, path: 'programming/languages.html', title: 'Ngôn ngữ lập trình', description: 'Tổng quan và cách chọn ngôn ngữ phù hợp với mục tiêu.', tags: ['Code', 'Tổng quan'] },
  { id: 'core-concepts', category: 'programming', order: 3, path: 'programming/core-concepts.html', title: 'Khái niệm quan trọng', description: 'Biến, hàm, điều kiện và tư duy nền tảng khi viết code.', tags: ['Concept', 'Căn bản'] },
  { id: 'python', category: 'programming', order: 4, path: 'programming/python.html', title: 'Python', description: 'Cú pháp, cấu trúc và những ứng dụng nổi bật của Python.', tags: ['Python', 'Language'] },
  { id: 'c-cpp', category: 'programming', order: 5, path: 'programming/c-cpp.html', title: 'C và C++', description: 'Hai ngôn ngữ nền tảng và các khái niệm cốt lõi.', tags: ['C/C++', 'System'] },
  { id: 'java-javascript', category: 'programming', order: 6, path: 'programming/java-javascript.html', title: 'Java & JavaScript', description: 'Phân biệt và tìm hiểu hai ngôn ngữ phổ biến này.', tags: ['Java', 'JavaScript'] },

  { id: 'cloudflare', category: 'web', order: 1, path: 'web/cloudflare.html', title: 'Cloudflare là gì?', description: 'DNS, CDN, bảo mật và cách Cloudflare tăng tốc website.', tags: ['Cloudflare', 'Web'] }
];

window.KNOWLEDGE_CATEGORIES = {
  devops: { label: 'DevOps căn bản', short: 'DevOps', index: '01', symbol: '⌁' },
  aws: { label: 'AWS & dịch vụ Cloud', short: 'AWS Cloud', index: '02', symbol: '☁' },
  ai: { label: 'AI & Machine Learning', short: 'AI', index: '03', symbol: '✺' },
  programming: { label: 'Lập trình từ nền tảng', short: 'Lập trình', index: '04', symbol: '{ }' },
  web: { label: 'Web & hiệu năng', short: 'Web', index: '05', symbol: '◎' }
};
