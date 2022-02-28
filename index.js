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

//INITIAL PROMPT
const promptToDo = () => {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'typeToDo',
        message: 'What would you like to do?',
        choices: ['View all employees', 'Add employee', 'Update employee role','View All Roles','Add Role','View All Departments','Add Department'],
      },
    ]);
};

//PROMPT FOR ADDING DEPARTMENT
const promptAddDepartment = () => {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'typeOfDepartment',
        message: 'What is the name of the Department?',        
      },
    ]);
};

//PROMPT FOR ADDING ROLE WITH DEPARTMENT LIST INSIDE
const callpromptAddRole = () => {

  db.promise().query('SELECT id, name FROM Department;')
    .then( ([rows,fields]) => {  
        
        //console.log('Department rows', rows);        
        return rows; //send the departemt rows to the next .then
    })
    .catch(console.log)
    //rows --> department rows (id and name)
    .then( (rows) => {
        //call initRolePrompt and recieve the values from user
        //title, salary, deparment, id_department
        initRolePrompt(rows)
        .then( (answers) => {
          //console.log('deparment rows',rows);
          //console.log("Role answers",answers);

          const department = rows.find( department => department.name === answers.departmentOfRole );
       
          //console.log('idDepartment',department.id);

          //SAVE ROLE ANSWERS
          var title = answers.nameOfRole;
          var salary = answers.salaryOfRole;
          var department_id = department.id;

          db.promise().query(`INSERT INTO role(title,salary,department_id) VALUES ('${title}','${salary}','${department_id}')`)
          .then( (result) => {       
              //const table = cTable.getTable(rows);          
              //console.log('result',result);
          })
          .catch(console.log)
          .then( () => {
              console.log('Role added');
              init();
              //db.end();
          });//end then for init() 
          // init()
        }); //end then initRolePrompt();
        
    });//end then db search for Deparments-> inside callpromptAddRole
  
  const initRolePrompt = (rows) =>{
   //console.log('rows inside initRolePrompt',rows); 
   const rowArray = rows;        
   const nameRows = rowArray.map(rows => rows.name);

   return inquirer.prompt([
      {
        type: 'input',
       name: 'nameOfRole',
       message: 'What is the name of the Role?',        
      },
      {
       type: 'input',
       name: 'salaryOfRole',
       message: 'What is the salary of the Role?',        
      },
      {
       type: 'list',
       name: 'departmentOfRole',
       message: 'Which department does the role belong to?',       
       choices: nameRows,
      },
    ]);
  }//end initRolePrompt
};


//PROMPT FOR ADDING EMPLOYEE WITH ROLE AND EMPLOYEE(MANAGER) LIST INSIDE
const callpromptAddEmployee = () => {

  //SEARCH FOR ROLES AND MANAGERS(EMPLOYEES)

  //AFTER SEARCH ROLES AND MANAGERS CALL PROMPT initEmployeePrompt WITH VALUES
  //AFTER RECEIVE VALUES FROM PROMPT SAVE IT

  db.promise().query('SELECT role.id, role.title, department.name, role.salary FROM role LEFT JOIN department ON department.id = role.department_id')
    .then( ([rowsRole]) => {
       return rowsRole; //send the departemt rows to the next .then
    })//end then with rowsRole result
    .catch(console.log)
    //rows --> department rows (id and name)
    .then( (rowsRole) => { //rowsRole --> role.id, role.title, department.name, role.salary
        
        
        //another search for managers table        
          db.promise().query('SELECT employee.id, employee.first_name FROM employee')
          .then( ([rowsManager]) => {

                //call initRolePrompt and recieve the values from user
                initEmployeePrompt(rowsRole,rowsManager)
                .then( (answers) => {
                  //console.log('Role rows',rowsRole);
                  //console.log('Manager rows',rowsManager);
                  //console.log("Employee answers",answers); 
                  
                  const role = rowsRole.find( role => role.title === answers.roleOfEmployee);              
                  //console.log('idRole selected', role.id); 
                  
                  if (answers.managerOfEmployee == "None"){
                    manager_id = null;
                  } else {
                    const manager = rowsManager.find( manager => manager.first_name === answers.managerOfEmployee); 
                    var manager_id = manager.id;                                 
                  }
                  //console.log('idManager selected', manager_id); 
                  
                  //SAVE employee ANSWERS  
                  //first_name,last_name,role_id,manager_id
                  var first_name = answers.firstnameOfEmployee;
                  var last_name = answers.lastnameOfEmployee;
                  var role_id = role.id;
                  

                  db.promise().query(`INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES ('${first_name}','${last_name}','${role_id}','${manager_id}')`)
                  .then( (result) => {       
                      //const table = cTable.getTable(rows);          
                      //console.log('result',result);
                  })
                  .catch(console.log)
                  .then( () => {
                      console.log('Employee added')
                      init();
                      //db.end();
                  });//end then for init() 
                  
                //init(); //init menu
                }); //end then initRolePrompt();
            
            
          })//end of db employee search --> inside then db search Departments
          .catch(console.log)
       
        
        
  });//end then db search for Deparments and roles-> inside callpromptAddRole
  
  const initEmployeePrompt = (rowsRole,rowsManager) =>{   
    const rowRoleArray = rowsRole;   
    const roleTitleRows = rowRoleArray.map(rowsRole => rowsRole.title); 
    const rowManagerArray = rowsManager; 
    const employeeNameRows = rowManagerArray.map(rowsManager => rowsManager.first_name);
  
    employeeNameRows.unshift('None'); //add None to the manager array
    //console.log('employeeNameRows',employeeNameRows);

    return inquirer.prompt([
      {
        type: 'input',
       name: 'firstnameOfEmployee',
       message: 'What is the employee´s first name?',        
      },
      {
        type: 'input',
       name: 'lastnameOfEmployee',
       message: 'What is the employee´s last name?',        
      },      
      {
       type: 'list',
       name: 'roleOfEmployee',
       message: 'What is the employee´s role?',       
       choices: roleTitleRows,
      },
      {
        type: 'list',
        name: 'managerOfEmployee',
        message: 'Who is the employee´s manager?',        
        choices: employeeNameRows,
       },
    ]);
  }//end initRolePrompt
};//end callpromptAddEmployee function



//PROMPT FOR UPDATING EMPLOYEE WITH ROLE AND EMPLOYEE(MANAGER) LIST INSIDE
const callpromptUpdateEmployee = () => {

  //SEARCH FOR EMPLOYEES AND ROLES

  //AFTER SEARCH EMPLOYEES AND ROLES CALL PROMPT initUpdateEmployeePrompt WITH VALUES
  //AFTER RECEIVE VALUES FROM PROMPT SAVE IT

  db.promise().query('SELECT employee.id, employee.first_name, employee.last_name FROM employee')
  .catch(console.log)
  .then( ([rowsEmployee]) => {

        db.promise().query('SELECT * FROM role')
        .catch(console.log)
        .then( ([rowsRole]) => {

              //CALL THE UPDATE PROMPT
              initUpdateEmployeePrompt(rowsEmployee,rowsRole)
              .then( (answers) => {
                console.log('Update Employee Answers',answers);
            
               

                const role = rowsRole.find( role => role.title === answers.roleToUpdate);              
                console.log('idRole selected', role.id); 
                  
                const employee = rowsEmployee.find( employee => (employee.first_name+' '+employee.last_name) === answers.employeeToUpdate);              
                console.log('idEmployee selected', employee.id); 

                 //UPDATE EMPLOYEE ANSWERS
                db.promise().query(`UPDATE employee set role_id = ${role.id} WHERE id = ${employee.id} `)
                .then( (result) => {       
                    //const table = cTable.getTable(rows);          
                    //console.log('result',result);
                })
                .catch(console.log)
                .then( () => {
                    console.log('Employee updated')
                    init();
                    //db.end();
                });//end then for init() 

                //init(); //principal menu
              }); //end of then queryinitUpdateEmployeePrompt

        });//end of then role query
  
  
  });//end of db SELECT employees



  const initUpdateEmployeePrompt = (rowsEmployee,rowsRoles) =>{   
    /*const rowRoleArray = rowsRole;   
    const roleTitleRows = rowRoleArray.map(rowsRole => rowsRole.title); 
    const rowManagerArray = rowsManager; 
    const employeeNameRows = rowManagerArray.map(rowsManager => rowsManager.first_name);
    */

    const rowEmployeeArray = rowsEmployee;   
    const employeeNames = rowEmployeeArray.map(rowsEmployee => rowsEmployee.first_name+' '+rowsEmployee.last_name); 

    const rowRoleArray = rowsRoles;   
    const employeeRoles = rowRoleArray.map(rowsRoles => rowsRoles.title);

    //employeeNames=['Marco Glz','Jess Flores',rowsEmployee];
    //employeeRoles=['Sales','Marketing',rowsRoles]

    return inquirer.prompt([            
      {
       type: 'list',
       name: 'employeeToUpdate',
       message: 'Which employee´s role do you want to update?',       
       choices: employeeNames,
      },
      {
        type: 'list',
        name: 'roleToUpdate',
        message: 'Which role do you want to assign to the selected employee?',        
        choices: employeeRoles,
       },
    ]);
    
  }//end };//end initUpdateEmployeePrompt function

  


};//end callpromptUpdateEmployee function


// INIT FUNCTION CALLS DE INITIAL MENU
const init = () => {
    promptToDo()    
    .then((answers) => toDo(answers))
    //.then((ansToDo) => displayTable(ansToDo))    
    .catch((err) => console.error(err));
};
init();


//TODO FUNCION RELATED TO THE PRINCIPAL MENU
const toDo = (answer) => {
    //console.log('answer to do',answer);
    
    switch(answer.typeToDo) {
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


const addEmployee = () =>{
  callpromptAddEmployee();
}

const updateEmployee = () =>{
  callpromptUpdateEmployee();
}

const addRole = () =>{
  callpromptAddRole()  
}

const addDepartment = () =>{
  promptAddDepartment()
  .then((answers) => saveDepartment(answers))  
  .catch((err) => console.error(err));
}

const saveDepartment = (answers) => {
  var department = answers.typeOfDepartment;
  console.log('Save department:',department);
  db.promise().query(`INSERT INTO department(name) VALUES ('${department}')`)
    .then( (result) => {       
        //const table = cTable.getTable(rows);          
        //console.log('result',result);
    })
    .catch(console.log)
    .then( () => {
        console.log('Department added')
        init();
        //db.end();
    });  
}

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



