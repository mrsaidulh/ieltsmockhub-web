# IELTS Mock Hub — Private VM & MySQL Setup Guide
This guide provides complete, step-by-step instructions to deploy your **IELTS Mock Hub** platform on your private Virtual Machine (`172.20.10.3`) using a persistent **MySQL** database for security and student lead generation.

---

## Architecture Overview
* **Virtual Machine IP:** `172.20.10.3`
* **Operating System:** Ubuntu 22.04 LTS / Debian
* **Frontend/Backend Server:** Node.js (Express + Vite Server running on port `3000`)
* **Process Manager:** PM2 (for 24/7 background uptime)
* **Database:** MySQL Server (local or remote)
* **Reverse Proxy:** Nginx (mapping standard port `80` to Node port `3000`)

---

## Step 1: Install Required Packages on VM `172.20.10.3`

SSH into your private virtual machine:
```bash
ssh user@172.20.10.3
```

Update system repositories and install Node.js (v18+ or v20+), Nginx, and MySQL Server:
```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx and MySQL Server
sudo apt-get install -y nginx mysql-server

# Verify installations
node -v
npm -v
nginx -v
mysql --version
```

---

## Step 2: Configure MySQL Database and Create Schemas

Secure your MySQL installation and configure root credentials:
```bash
sudo mysql_secure_installation
```

Log into MySQL console:
```bash
sudo mysql -u root -p
```

Create the application database, standard database user, and configure table definitions matching your lead verification strategy:
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS ielts_mock_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with access rights
CREATE USER 'ielts_admin'@'localhost' IDENTIFIED BY 'YourSecurePasswordHere';
GRANT ALL PRIVILEGES ON ielts_mock_hub.* TO 'ielts_admin'@'localhost';
FLUSH PRIVILEGES;

USE ielts_mock_hub;

-- 1. Create Student Leads Table (Matches Name, Email, and Bangladeshi Phone Number OTP Flow)
CREATE TABLE IF NOT EXISTS student_leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL UNIQUE,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create Test Attempt History Table (Persists IELTS test bands and metrics)
CREATE TABLE IF NOT EXISTS attempt_history (
    id VARCHAR(100) PRIMARY KEY,
    student_lead_id INT,
    test_id VARCHAR(50) NOT NULL,
    test_title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    band_score DECIMAL(3, 1) NOT NULL,
    correct_answers INT DEFAULT NULL,
    total_questions INT DEFAULT NULL,
    time_spent_minutes INT NOT NULL,
    examiner_feedback TEXT DEFAULT NULL,
    FOREIGN KEY (student_lead_id) REFERENCES student_leads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create Vocabulary Bank Table (Stores difficult words noted by student leads)
CREATE TABLE IF NOT EXISTS vocabulary_bank (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_lead_id INT,
    word VARCHAR(150) NOT NULL,
    definition TEXT NOT NULL,
    example_sentence TEXT DEFAULT NULL,
    source_test_title VARCHAR(255) DEFAULT NULL,
    date_added DATE NOT NULL,
    mastered BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_lead_id) REFERENCES student_leads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

EXIT;
```

---

## Step 3: Set Up and Build the App Code

1. **Clone or transfer** your app repository to the `/var/www/ieltsmockhub` directory on your VM:
   ```bash
   sudo mkdir -p /var/www/ieltsmockhub
   sudo chown -R $USER:$USER /var/www/ieltsmockhub
   # Transfer code into this folder (using scp, rsync, or git)
   ```

2. **Configure environment secrets** by creating a `.env` file in the root folder:
   ```bash
   cd /var/www/ieltsmockhub
   nano .env
   ```

   Write the following parameters into `.env`:
   ```env
   NODE_ENV=production
   PORT=3000
   
   # MySQL DB Connection Configuration
   DB_HOST=localhost
   DB_USER=ielts_admin
   DB_PASSWORD=YourSecurePasswordHere
   DB_NAME=ielts_mock_hub
   
   # Optional: Set up your SMS Gateway keys for sending real Bangladeshi mobile SMS
   # SMS_API_KEY=your_bangladeshi_sms_provider_api_key
   ```

3. **Install npm dependencies and compile production builds**:
   ```bash
   npm install
   npm run build
   ```

---

## Step 4: Configure Node/Express Server to Connect to MySQL

When migrating your backend from static state to MySQL, include the `mysql2` package:
```bash
npm install mysql2
```

In your server file, initialize a connection pool and expose API routes to save Leads and Attempts:
```ts
import mysql from 'mysql2/promise';

// Initialize MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'ielts_admin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ielts_mock_hub',
  waitForConnections: true,
  connectionLimit: 10,
});

// API endpoint to record a newly verified Student Lead and their test results
app.post('/api/submit-lead-test', async (req, res) => {
  const { name, email, phone, attempt } = req.body;
  
  try {
    // 1. Insert or update student lead details
    const [leadResult]: any = await pool.execute(
      `INSERT INTO student_leads (name, email, phone, verified) 
       VALUES (?, ?, ?, TRUE) 
       ON DUPLICATE KEY UPDATE name = ?, verified = TRUE`,
      [name, email, phone, name]
    );
    
    // Get lead ID
    let leadId;
    if (leadResult.insertId) {
      leadId = leadResult.insertId;
    } else {
      const [rows]: any = await pool.execute('SELECT id FROM student_leads WHERE email = ?', [email]);
      leadId = rows[0].id;
    }
    
    // 2. Insert test completion attempt
    await pool.execute(
      `INSERT INTO attempt_history 
       (id, student_lead_id, test_id, test_title, category, date, band_score, correct_answers, total_questions, time_spent_minutes, examiner_feedback) 
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?)`,
      [
        attempt.id,
        leadId,
        attempt.testId,
        attempt.testTitle,
        attempt.category,
        attempt.bandScore,
        attempt.correctAnswers || null,
        attempt.totalQuestions || null,
        attempt.timeSpentMinutes,
        attempt.examinerFeedback
      ]
    );
    
    res.status(200).json({ success: true, leadId });
  } catch (err: any) {
    console.error('MySQL persistence error:', err);
    res.status(500).json({ error: 'Database transaction failed.' });
  }
});
```

---

## Step 5: Start the App 24/7 using PM2

PM2 ensures your Node process remains active, restarts on system reboots, and automatically respawns on code crashes:
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start express server
pm2 start dist/server.cjs --name "ielts-mock-hub"

# Set PM2 to boot on VM startup
pm2 startup systemd
# (Run the generated command printed on your screen by PM2, then save current state)
pm2 save
```

---

## Step 6: Configure Nginx Reverse Proxy for Public Port 80 Ingress

Create an Nginx configuration file to redirect incoming HTTP web traffic from port `80` to your running app port `3000`:
```bash
sudo nano /etc/nginx/sites-available/ieltsmockhub
```

Paste the following configurations (replacing the IP address if your domain `IELTSmockhub.com` is configured):
```nginx
server {
    listen 80;
    server_name IELTSmockhub.com www.IELTSmockhub.com 172.20.10.3;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Custom log configurations
    access_log /var/log/nginx/ieltsmockhub_access.log;
    error_log /var/log/nginx/ieltsmockhub_error.log;
}
```

Enable the configuration and restart Nginx:
```bash
# Link to enabled sites
sudo ln -s /etc/nginx/sites-available/ieltsmockhub /etc/nginx/sites-enabled/

# Remove default configuration to avoid conflict
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart service
sudo systemctl restart nginx
```

---

## Step 7: Access and Test Your Platform!
Open your browser and visit:
`http://172.20.10.3` (or `http://IELTSmockhub.com` if DNS records are bound)

Your visitor-to-lead verification loop is now active and fully backed by a powerful MySQL database!
