-- Connect to the database
\c employee_tracker;

-- Clear existing data
TRUNCATE employee, role, department RESTART IDENTITY CASCADE;

-- Insert departments
INSERT INTO department (name) VALUES 
('Engineering'),
('Finance'),
('Human Resources');

-- Insert roles
INSERT INTO role (title, salary, department_id) VALUES 
('Software Engineer', 80000, 1),
('Accountant', 60000, 2),
('HR Specialist', 50000, 3),
('Senior Software Engineer', 100000, 1);

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, NULL),
('Emily', 'Jones', 3, NULL),
('Michael', 'Brown', 4, 1);