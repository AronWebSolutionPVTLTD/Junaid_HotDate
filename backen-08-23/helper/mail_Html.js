const mailHtml = (data, link, text) => {
    console.log(data,"=================================")
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Hot Date Couple Matching!</title>
            <style>
                /* Add your custom CSS styles here */
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #F4F4F4;
                }
                .container {
                    max-width: 600px;
                    margin: 30px auto;
                    background-color: #FFFFFF;
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    background-color: #F79220;
                }
                .header h1 {
                    color: #FFFFFF;
                }
                .content {
                    padding: 20px;
                }
                .button-container {
                    text-align: center;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #F79220;
                    color: #FFFFFF;
                    text-decoration: none;
                }
                .footer {
                    text-align: center;
                    padding: 10px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Hot Date App!</h1>
                </div>
                <div class="content">
                    <p>Hello ${data.name},</p>
                    <p>${text}</p>
                    <p>Your registration details:</p>
                    <ul>
                        <li><strong>Name:</strong> ${data.name}</li>
                        <li><strong>Email:</strong> ${data.email}</li>
                    </ul>
                    <p>We look forward to helping you find your perfect match. Get started by completing your profile and exploring potential matches on our platform.</p>
                    <p>If you have any questions or need assistance, feel free to contact our support team.</p>
                    <div class="button-container">
                        <a class="button" href=${link} target="_blank">Verify Email</a>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2023 Hot Date Couple. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>`;
}
module.exports = mailHtml;