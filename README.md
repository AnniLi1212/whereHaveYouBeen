# Where Have You Been - Backend

## Overview  
This is the backend implementation for the "Where Have You Been" project in EE 547 at University of Southern California. This is a personal travel journal app that allows users to log places they've visited, manage wishlists, and view travel summaries. The backend is built by **Node.js**.

---

## Features  
- **User Authentication**: Secure login/signup with hashed passwords (bcryptjs) and API key generation.  
- **Travel Management**: Manage visited places (history) and wishlist.  
- **Search Integration**: Fetch places and images using Google Maps API.  
- **Report Generation**: Generate user reports and summaries based on preferences.  
- **Notifications**: Scheduled notifications using AWS EventBridge.  

---

## Architecture  

### Key Technologies  
- **Node.js**: Backend runtime.  
- **AWS Lambda**: Serverless compute for handling API requests.  
- **AWS DynamoDB**: NoSQL database for managing users, history, wishlist, and reports.    
- **bcryptjs**: Password hashing.  
- **Express**: Lightweight framework for routing.  
- **Middleware**: reuseable middleware for error handling and user authentication.


## Folder Structure  
```
backend/
├── analyze/              # analyze server
├── main/                 # place, history, wishlist server
├── routes/               # API route definitions
├── user/                 # login, signup, user_key generator
├── notification/         # notification and report server
├── middleware/           # Error handler and  authentication
├── package.json          # Project dependencies
├── package-lock.json     # Project dependencies
├── app.js                # Architexture
└── index.js              # Entry point for the application
```

---

## API Endpoints  
The backend exposes the following RESTful APIs:  

### User API  
| Method | Endpoint       | Description                 |
|--------|----------------|-----------------------------|
| POST   | `/signup`      | User signup.               |
| POST   | `/login`       | User login.                |
| GET    | `/users`       | Retrieve user profile.     |

### Place API  
| Method | Endpoint            | Description                    |
|--------|---------------------|--------------------------------|
| GET    | `/places`           | Search for places.             |
| GET    | `/places/:placeID`  | Fetch place details.           |

### History & Wishlist API  
| Method | Endpoint              | Description                         |
|--------|-----------------------|-------------------------------------|
| GET    | `/history`            | Retrieve visited places.            |
| POST   | `/history`            | Add a new visited place.            |
| DELETE | `/history/:placeID`   | Delete a visited place.             |
| GET    | `/wishlist`           | Retrieve wishlist.                  |
| POST   | `/wishlist`           | Add a place to the wishlist.        |
| DELETE | `/wishlist/:placeID`  | Remove a place from the wishlist.   |

### Notification & Report API  
| Method | Endpoint                    | Description                      |
|--------|-----------------------------|----------------------------------|
| GET    | `/notification`             | Retrieve generated reports.      |
| GET    | `/notification/:reportID`   | Fetch details of a specific report. |
| POST   | `/notification/subscription`| Manage subscriptions.            |

### Analyze API  
| Method | Endpoint                    | Description                      |
|--------|-----------------------------|----------------------------------|
| GET   | `/analyze`| Dashboard analysis.            |

---

## Installation  

### Prerequisites  
- Node.js (v22+ recommended)  
- Google Maps API key
- AWS account (optional)

### Steps  
1. **Clone the repository**:  
   ```bash
   git clone https://github.com/allenLau0708/ee547_final_whereHaveYouBeen.git
   ```

2. **Install dependencies**:  
   ```bash
   npm install
   ```

3. **Set up environment variables**:  
   Create a `.env` file in the root directory with the following fields:  
   ```plaintext
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   AWS_ACCESS_KEY_ID=your_aws_key_id (optional)
   AWS_SECRET_ACCESS_KEY=your_aws_key (optional)
   ```

4. **Run locally**:  
   ```bash
   node index.js
   ```

---


## Dependencies  
This project uses the following dependencies:  
- **@aws-sdk/client-dynamodb**: DynamoDB client.  
- **@aws-sdk/client-lambda**: AWS Lambda client.  
- **@aws-sdk/client-ses**: AWS SES client for emails.  
- **@aws-sdk/client-ssm**: AWS SSM for secure parameter storage.  
- **@aws-sdk/lib-dynamodb**: DynamoDB wrapper library.  
- **aws-xray-sdk**: Tracing requests for AWS services.  
- **axios**: HTTP requests.  
- **bcryptjs**: Password hashing.  
- **body-parser**: Parse incoming request bodies.  
- **cors**: Handle Cross-Origin Resource Sharing.  
- **dotenv**: Load environment variables.  
- **express**: Lightweight web framework.  
- **node-fetch**: Fetch API for Node.js.  
- **serverless-http**: Middleware for Lambda integration.  

---

## Contributing  
Contributions are welcome! Please follow these steps:  
1. Fork the repository.  
2. Create a new branch: `git checkout -b feature-branch`.  
3. Commit your changes: `git commit -m "Add new feature"`.  
4. Push the branch: `git push origin feature-branch`.  
5. Submit a Pull Request.  

---

## License  
This project is licensed under the MIT License.  

---

## Contact  
For questions or suggestions, please contact:  
- **Zeli Liu** - `zeliliu@usc.edu`
- **Anni Li** - `annili@usc.edu`
- **Kaisen Ye** - `kaisenye@usc.edu`

