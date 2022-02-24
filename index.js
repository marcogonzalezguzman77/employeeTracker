const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

// Connect to database
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: 'guero137',
      database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
  );


const promptToDo = () => {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'typeofteamAdd',
        message: 'What would you like to do?',
        choices: ['View all employees', 'Add employee', 'Update employee role','View All Roles','Add Role','View All Departments','Add Department'],
      },
    ]);
  };
  

// Bonus using writeFileSync as a promise
const init = () => {
    promptToDo()    
    .then((answers) => toDo(answers))
    //.then((ansToDo) => displayTable(ansToDo))    
    .catch((err) => console.error(err));
};
init();

const toDo = (answer) => {
    //console.log('answer to do',answer);
    
    switch(answer.typeofteamAdd) {
        case "View all employees":
          // code block
          viewEmployees();
          break;
        case "Add employee":
          // code block
          addEmployee();
          break;
        case "Update employee role":
          // code block
          updateEmployee();
          break;
        case "View All Roles":
            // code block
          viewRoles();  
          break;
        case "Add Role":
          // code block
          addRole();
          break;
        case "View All Departments":
          // code block
          viewDepartments();
          break;
        case "Add Department":
         // code block
         addDepartment();
          break;        
      }
};


const viewEmployees = () =>{
   db.promise().query('SELECT employee.id,employee.first_name,employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name," ",manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee AS manager ON manager.id = employee.manager_id')
    .then( ([rows,fields]) => {       
        const table = cTable.getTable(rows);          
        console.log(table);
    })
    .catch(console.log)
    .then( () => {
        init();
        //db.end();
    });
}

const addEmployee = () =>{
    console.log('Add employee');
    init();
}

const updateEmployee = () =>{
    console.log('Update employee role');
    init();
}

const viewRoles = () =>{
    db.promise().query('SELECT role.id,role.title, department.name, role.salary FROM role LEFT JOIN department ON department.id = role.department_id;')
    .then( ([rows,fields]) => {       
        const table = cTable.getTable(rows);          
        console.log(table);
    })
    .catch(console.log)
    .then( () => {
        init();
        //db.end();
    });
}

const addRole = () =>{
    console.log('Add Role');
    init();
}

const viewDepartments = () =>{
    db.promise().query('SELECT * FROM department;')
    .then( ([rows,fields]) => {       
        const table = cTable.getTable(rows);          
        console.log(table);
    })
    .catch(console.log)
    .then( () => {
        init();
        //db.end();
    });
}

const addDepartment = () =>{
    console.log('Add Department');
    init();
}

