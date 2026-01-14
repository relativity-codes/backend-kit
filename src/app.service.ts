import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Page</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #00FF, #000000);
      color: #fff;
      text-align: center;
    }

    .container {
      max-width: 600px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    }

    h1 {
      font-size: 2.5em;
      margin-bottom: 20px;
    }

    p {
      font-size: 1.2em;
      margin-bottom: 30px;
    }

    a {
      display: inline-block;
      text-decoration: none;
      background: #fff;
      color: #6a11cb;
      padding: 10px 20px;
      border-radius: 5px;
      font-weight: bold;
      transition: background 0.3s ease, color 0.3s ease;
    }

    a:hover {
      background: #F0F0F0;
      color: #fff;
    }

    footer {
      margin-top: 30px;
      font-size: 0.9em;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello and Welcome!</h1>
    <p>Explore our API documentation and unleash the power of your creativity.</p>
    <a href="/api">Click Here For Swagger Documentation</a>
<footer>
  &copy; <span id="currentYear">2024</span> Backend Kit. Made with ❤️ by Relativity.
</footer>
<script>
  // Dynamically set the current year
  document.getElementById('currentYear').textContent = new Date().getFullYear();
</script>
  </div>
</body>
</html>
`;
  }
}
