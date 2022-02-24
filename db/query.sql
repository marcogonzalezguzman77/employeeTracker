use employee_db;

/* View all departments */
SELECT * FROM
department;

/* View all roles */
SELECT role.id,role.title,
department.name, role.salary
FROM role
LEFT JOIN department
ON department.id = role.department_id;

/* View all employees */
SELECT employee.id,employee.first_name,employee.last_name,
role.title, department.name AS department, role.salary, CONCAT(manager.first_name," ",manager.last_name) AS manager
FROM employee
LEFT JOIN role
ON employee.role_id = role.id
LEFT JOIN department
ON role.department_id = department.id
LEFT JOIN employee AS manager
ON  manager.id = employee.manager_id 
