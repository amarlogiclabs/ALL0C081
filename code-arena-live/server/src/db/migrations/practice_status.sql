CREATE TABLE IF NOT EXISTS user_problem_status (
    user_id VARCHAR(255) NOT NULL,
    problem_id INT NOT NULL,
    status ENUM('solved', 'attempted') DEFAULT 'attempted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, problem_id)
);
