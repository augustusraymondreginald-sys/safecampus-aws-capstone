-- Insert Security Admin Account (email: admin@safecampus.edu)
INSERT INTO users (full_name, email, password_hash, role) VALUES 
('Campus Security Admin', 'admin@safecampus.edu', '$2a$10$wT8Kz8w7J.wN7Z4L9Y6m6uMvF2X9m3y1vX4.v1Y8z9W0X1Y2Z3A4B', 'ADMIN');

-- Insert Sample Student Account (email: student@safecampus.edu)
INSERT INTO users (full_name, email, password_hash, role) VALUES 
('John Doe', 'student@safecampus.edu', '$2a$10$wT8Kz8w7J.wN7Z4L9Y6m6uMvF2X9m3y1vX4.v1Y8z9W0X1Y2Z3A4B', 'STUDENT');

-- Insert Sample Incident
INSERT INTO incidents (user_id, title, category, priority, location, description, status) VALUES 
(2, 'Broken Lighting behind Science Block', 'Infrastructure', 'HIGH', 'Science Quad, Path 3', 'Streetlight light bulb is out creating a total dark spot.', 'OPEN');