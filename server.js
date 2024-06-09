const inquirer = require('inquirer');
const { Client } = require('pg');


const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'employee_tracker',
    password: 'rootroot',
    port: 5432
});

// Connect to the database
client.connect()
    .then(() => {
        console.log('Connected to the database.');
        startApp();
    })
    .catch(err => console.error('Connection error', err.stack));

// Main function to start the application
function startApp() {
    inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
        ]
    }).then(answer => {
        switch (answer.action) {
            case 'View all departments':
                viewAllDepartments();
                break;
            case 'View all roles':
                viewAllRoles();
                break;
            case 'View all employees':
                viewAllEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Exit':
                client.end();
                break;
        }
    });
}

// Function to prompt to return to the main menu
function promptReturn() {
    inquirer.prompt({
        type: 'confirm',
        name: 'return',
        message: 'Would you like to return to the main menu?',
        default: true
    }).then(answer => {
        if (answer.return) {
            startApp();
        } else {
            client.end();
        }
    });
}

// Function to view all departments
function viewAllDepartments() {
    client.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        promptReturn();
    });
}

// Function to view all roles
function viewAllRoles() {
    const query = `
        SELECT role.id, role.title, department.name AS department, role.salary 
        FROM role
        JOIN department ON role.department_id = department.id`;
    client.query(query, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        promptReturn();
    });
}

// Function to view all employees
function viewAllEmployees() {
    const query = `
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
        FROM employee 
        JOIN role ON employee.role_id = role.id 
        JOIN department ON role.department_id = department.id 
        LEFT JOIN employee manager ON employee.manager_id = manager.id`;
    client.query(query, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        promptReturn();
    });
}

// Function to add a new department
function addDepartment() {
    inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the name of the department:'
    }).then(answer => {
        client.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err, res) => {
            if (err) throw err;
            console.log('Department added.');
            startApp();
        });
    });
}

// Function to add a new role
function addRole() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter the title of the role:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary for the role:'
        },
        {
            type: 'input',
            name: 'department_id',
            message: 'Enter the department ID for the role:'
        }
    ]).then(answers => {
        const { title, salary, department_id } = answers;
        client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', 
        [title, salary, department_id], (err, res) => {
            if (err) throw err;
            console.log('Role added.');
            startApp();
        });
    });
}

// Function to add a new employee
function addEmployee() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter the first name of the employee:'
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter the last name of the employee:'
        },
        {
            type: 'input',
            name: 'role_id',
            message: 'Enter the role ID for the employee:'
        },
        {
            type: 'input',
            name: 'manager_id',
            message: 'Enter the manager ID for the employee (or leave blank if no manager):',
            default: null
        }
    ]).then(answers => {
        const { first_name, last_name, role_id, manager_id } = answers;
        client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', 
        [first_name, last_name, role_id, manager_id], (err, res) => {
            if (err) throw err;
            console.log('Employee added.');
            startApp();
        });
    });
}

// Function to update an employee's role
function updateEmployeeRole() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'employee_id',
            message: 'Enter the ID of the employee you want to update:'
        },
        {
            type: 'input',
            name: 'role_id',
            message: 'Enter the new role ID for the employee:'
        }
    ]).then(answers => {
        const { employee_id, role_id } = answers;
        client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id], (err, res) => {
            if (err) throw err;
            console.log('Employee role updated.');
            startApp();
        });
    });
}